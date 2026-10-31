import { describe, expect, it } from 'vitest'
import { renderEmail } from '@/features/email/layout'
import { campaignEmail, listingForReviewEmail, listingRejectedEmail } from '@/features/marketplace/emails'
import { cloudinarySignature } from '@/features/marketplace/media'
import { listingSchema, listingSlug } from '@/features/marketplace/schema'
import { createMemoryStore } from '@/features/marketplace/store-memory'
import type { Listing, NewListing } from '@/features/marketplace/types'
import { hashPassword, verifyPassword } from '@/security/password'
import { hashToken, isTokenShape, randomToken, sign, verifySignature } from '@/security/tokens'
import { isSlug } from '@/lib/slug'

const form = {
  kind: 'plot',
  purpose: 'sale',
  title: '200 gaj corner plot near Ajmer Road',
  description: 'East facing corner plot on a thirty foot road with clear papers.',
  price: '45,00,000',
  areaValue: '200',
  areaUnit: 'sqyd',
  bedrooms: '3',
  city: 'Jaipur',
  locality: 'Ajmer Road',
  sellerName: 'Asha Mehta',
  sellerPhone: '98290 12345',
  sellerEmail: 'asha@example.com',
  sellerRole: 'owner',
  consent: 'on',
}

const newListing = (overrides: Partial<NewListing> = {}): NewListing => ({
  reference: 'MKT-AAAAAA',
  slug: 'plot-mkt-aaaaaa',
  kind: 'plot',
  purpose: 'sale',
  title: form.title,
  description: form.description,
  priceInr: 4_500_000,
  areaValue: 200,
  areaUnit: 'sqyd',
  bedrooms: null,
  city: 'Jaipur',
  locality: 'Ajmer Road',
  images: [{ id: 'dev/x', width: 10, height: 10 }],
  sellerName: 'Asha Mehta',
  sellerPhone: '+919829012345',
  sellerEmail: 'asha@example.com',
  sellerRole: 'owner',
  confirmTokenHash: 'hash',
  confirmExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  ...overrides,
})

describe('listingSchema', () => {
  it('reads Indian-style prices and tidies the phone', () => {
    const data = listingSchema.parse(form)
    expect(data.price).toBe(4_500_000)
    expect(data.sellerPhone).toBe('9829012345')
  })

  it('drops bedrooms for kinds that have none', () => {
    expect(listingSchema.parse(form).bedrooms).toBeNull()
    expect(listingSchema.parse({ ...form, kind: 'villa' }).bedrooms).toBe(3)
  })

  it.each([
    ['price', '45'],
    ['price', 'call me'],
    ['areaValue', '0'],
    ['title', 'short'],
    ['title', 'A title with <script>alert(1)</script> in it'],
    ['description', 'too short'],
    ['city', '<img src=x>'],
    ['sellerEmail', 'not-an-email'],
    ['sellerPhone', '+911234567890'],
    ['consent', ''],
    ['kind', 'spaceship'],
  ])('rejects %s = %j', (field, value) => {
    expect(listingSchema.safeParse({ ...form, [field]: value }).success).toBe(false)
  })
})

describe('listingSlug', () => {
  it('is a valid, unique-by-reference slug', () => {
    const slug = listingSlug(form.title, 'MKT-7F3K2Q')
    expect(slug).toBe('200-gaj-corner-plot-near-ajmer-road-mkt-7f3k2q')
    expect(isSlug(slug)).toBe(true)
  })

  it('survives titles with no latin letters and very long titles', () => {
    expect(isSlug(listingSlug('जयपुर में प्लॉट बिक्री', 'MKT-AAAAAA'))).toBe(true)
    expect(isSlug(listingSlug('x'.repeat(120), 'MKT-AAAAAA'))).toBe(true)
  })
})

describe('review workflow', () => {
  const confirmed = async () => {
    const store = createMemoryStore()
    await store.createListing(newListing())
    const listing = (await store.confirmListing('hash', new Date())) as Listing
    return { store, listing }
  }

  it('starts hidden and unconfirmed', async () => {
    const store = createMemoryStore()
    const listing = await store.createListing(newListing())
    expect(listing.status).toBe('unconfirmed')
    expect((await store.listListings({ status: 'approved', limit: 10 })).total).toBe(0)
  })

  it('confirms once only, and refuses an expired link', async () => {
    const { store, listing } = await confirmed()
    expect(listing.status).toBe('pending')
    expect(await store.confirmListing('hash', new Date())).toBeUndefined()

    const late = createMemoryStore()
    await late.createListing(newListing({ confirmExpiresAt: new Date(Date.now() - 1000).toISOString() }))
    expect(await late.confirmListing('hash', new Date())).toBe('expired')
  })

  it('shows a listing only after approval, and records who decided', async () => {
    const { store, listing } = await confirmed()
    const admin = await store.createAdmin({ email: 'a@example.com', name: 'Asha', passwordHash: 'x' })
    if (admin === 'exists') throw new Error('unexpected')
    expect((await store.listListings({ status: 'approved', limit: 10 })).total).toBe(0)

    await store.reviewListing(listing.id, admin.id, 'approved')
    expect((await store.listListings({ status: 'approved', limit: 10 })).total).toBe(1)

    const down = await store.reviewListing(listing.id, admin.id, 'unpublished', 'Sold')
    expect(down?.status).toBe('rejected')
    expect((await store.listListings({ status: 'approved', limit: 10 })).total).toBe(0)

    const history = await store.listEvents(listing.id)
    expect(history.map((event) => event.action)).toEqual(['submitted', 'confirmed', 'approved', 'unpublished'])
    expect(history[2]?.adminName).toBe('Asha')
  })

  it('filters live listings', async () => {
    const { store, listing } = await confirmed()
    await store.reviewListing(listing.id, 'admin', 'approved')
    const find = (filters: object) => store.listListings({ status: 'approved', filters, limit: 10 }).then((page) => page.total)
    expect(await find({ kind: 'plot' })).toBe(1)
    expect(await find({ kind: 'villa' })).toBe(0)
    expect(await find({ city: 'jaipur' })).toBe(1)
    expect(await find({ maxPrice: 1_000_000 })).toBe(0)
  })
})

describe('subscribers', () => {
  it('are not active until confirmed, and can leave and return', async () => {
    const store = createMemoryStore()
    expect(await store.subscribe('a@example.com', 'hash', 'website')).toBe('created')
    expect(await store.activeSubscriberEmails()).toEqual([])
    expect((await store.confirmSubscriber('hash'))?.status).toBe('active')
    expect(await store.activeSubscriberEmails()).toEqual(['a@example.com'])
    expect(await store.subscribe('a@example.com', 'other', 'website')).toBe('already-active')
    expect(await store.unsubscribe('a@example.com')).toBe(true)
    expect(await store.activeSubscriberEmails()).toEqual([])
    expect(await store.subscribe('a@example.com', 'again', 'website')).toBe('renewed')
  })
})

describe('admin accounts and sessions', () => {
  it('refuses a duplicate email and signs a removed admin out', async () => {
    const store = createMemoryStore()
    const admin = await store.createAdmin({ email: 'a@example.com', name: 'Asha', passwordHash: 'x' })
    if (admin === 'exists') throw new Error('unexpected')
    expect(await store.createAdmin({ email: 'a@example.com', name: 'Other', passwordHash: 'y' })).toBe('exists')
    await store.createSession('s', admin.id, new Date(Date.now() + 1000))
    expect(await store.getSession('s')).toBeDefined()
    await store.deleteAdmin(admin.id)
    expect(await store.getSession('s')).toBeUndefined()
  })
})

describe('passwords and tokens', () => {
  it('hashes with a salt and verifies only the right password', async () => {
    const [one, two] = await Promise.all([hashPassword('a-long-password-1'), hashPassword('a-long-password-1')])
    expect(one).not.toBe(two)
    expect(one).not.toContain('a-long-password-1')
    expect(await verifyPassword('a-long-password-1', one)).toBe(true)
    expect(await verifyPassword('a-long-password-2', one)).toBe(false)
    expect(await verifyPassword('anything', 'garbage')).toBe(false)
  })

  it('makes tokens of the expected shape and stores only a hash', () => {
    const token = randomToken()
    expect(isTokenShape(token)).toBe(true)
    expect(isTokenShape('../etc/passwd')).toBe(false)
    expect(hashToken(token)).not.toContain(token)
  })

  it('binds a signature to its purpose and value', () => {
    const signature = sign('secret', 'unsubscribe', 'a@example.com')
    expect(verifySignature('secret', 'unsubscribe', 'a@example.com', signature)).toBe(true)
    expect(verifySignature('secret', 'unsubscribe', 'b@example.com', signature)).toBe(false)
    expect(verifySignature('secret', 'other', 'a@example.com', signature)).toBe(false)
    expect(verifySignature('other', 'unsubscribe', 'a@example.com', signature)).toBe(false)
  })
})

describe('Cloudinary signature', () => {
  // The example from Cloudinary's upload documentation.
  it('matches the documented algorithm', () => {
    expect(cloudinarySignature({ public_id: 'sample_image', timestamp: '1315060510' }, 'abcd')).toBe('b4ad47fb4e25c7bf5f92a20089f9db59bc302313')
  })
})

describe('emails', () => {
  const listing = { ...newListing(), id: 'id', status: 'pending', state: 'Rajasthan', confirmedAt: null, reviewedBy: null, reviewedAt: null, rejectReason: null, createdAt: '2026-10-01', updatedAt: '2026-10-01' } as Listing

  it('escape everything a seller typed', () => {
    const { html, subject } = listingForReviewEmail({ ...listing, title: '<img src=x onerror=alert(1)>\r\nBcc: x@evil.com', description: '<script>x</script>' })
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<script>')
    expect(subject).not.toMatch(/[\r\n]/)
  })

  it('give admins the seller details and a link into the panel', () => {
    const { text } = listingForReviewEmail(listing)
    expect(text).toContain('asha@example.com')
    expect(text).toContain('/admin/listings/id')
  })

  it('tell a rejected seller why', () => {
    expect(listingRejectedEmail(listing, 'Blurry photos', false).text).toContain('Blurry photos')
  })

  it('always carry an unsubscribe link on campaigns', () => {
    const { html, text } = campaignEmail({ subject: 'New plots', body: 'First.\n\nSecond.' }, [], 'https://example.com/unsubscribe?e=a&s=b')
    expect(text).toContain('Unsubscribe: https://example.com/unsubscribe?e=a&s=b')
    expect(html).toContain('https://example.com/unsubscribe?e=a&amp;s=b')
    expect(html).toContain('First.')
  })

  it('never link to anything but http(s)', () => {
    const { html } = renderEmail({ subject: 's', preheader: 'p', title: 't', reason: 'r', blocks: [{ type: 'button', label: 'Go', url: 'javascript:alert(1)' }] })
    expect(html).not.toContain('javascript:')
  })
})
