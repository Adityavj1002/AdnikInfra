import { describe, expect, it } from 'vitest'
import { compactPhone, enquirySchema } from '@/features/enquiry/schema'
import { isSlug } from '@/lib/slug'
import { normalizeLine, normalizeMultiline, pickFields } from '@/security/normalize'

const valid = {
  topic: 'buy',
  name: 'Asha Mehta',
  phone: '98290 12345',
  email: '',
  preference: 'call',
  message: '',
  consent: 'on',
}

function isoInDays(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

describe('enquirySchema', () => {
  it('accepts a minimal phone-first enquiry', () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true)
  })

  it.each(['9829012345', '+91 98290 12345', '098290-12345', '+919829012345', '+44 7700 900123'])('accepts phone %s', (phone) => {
    expect(enquirySchema.safeParse({ ...valid, phone }).success).toBe(true)
  })

  it.each(['12345', '5829012345', '98290123456789', 'call me', ''])('rejects phone %j', (phone) => {
    expect(enquirySchema.safeParse({ ...valid, phone }).success).toBe(false)
  })

  it('stores phones without formatting', () => {
    expect(enquirySchema.parse({ ...valid, phone: '+91 (98290) 12-345' }).phone).toBe('+919829012345')
    expect(compactPhone('98290 12345')).toBe('9829012345')
  })

  it.each(['आशा मेहता', 'આશા મહેતા', "Siobhán O'Neill", 'José-María Núñez'])('accepts names in any script: %s', (name) => {
    expect(enquirySchema.safeParse({ ...valid, name }).success).toBe(true)
  })

  it.each([
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    "Robert'); DROP TABLE leads;--",
    'javascript:alert(1)',
    '{{7*7}}',
  ])('rejects markup and injection payloads as a name: %s', (name) => {
    expect(enquirySchema.safeParse({ ...valid, name }).success).toBe(false)
  })

  it('keeps hostile text in a message as inert text (rendered by React, stored via bound parameters)', () => {
    const message = "Hello <script>alert(1)</script> '; DROP TABLE leads;-- and more"
    expect(enquirySchema.parse({ ...valid, message }).message).toBe(message)
  })

  it.each(['not-an-email', 'a@b', 'asha@example.com\nBcc: x@evil.com'])('rejects invalid or header-injecting email: %j', (email) => {
    expect(enquirySchema.safeParse({ ...valid, email }).success).toBe(false)
  })

  it('requires an email when the visitor asks to be emailed', () => {
    const result = enquirySchema.safeParse({ ...valid, preference: 'email' })
    expect(result.error?.issues[0]?.path).toEqual(['email'])
  })

  it('requires a message when selling or asking something else', () => {
    expect(enquirySchema.safeParse({ ...valid, topic: 'sell' }).success).toBe(false)
    expect(enquirySchema.safeParse({ ...valid, topic: 'sell', message: '3 BHK flat in Malviya Nagar' }).success).toBe(true)
  })

  it('accepts site-visit dates only within the booking window', () => {
    const visit = { ...valid, topic: 'site-visit', visitSlot: 'morning' }
    expect(enquirySchema.safeParse({ ...visit, visitDate: isoInDays(3) }).success).toBe(true)
    expect(enquirySchema.safeParse({ ...visit, visitDate: isoInDays(-1) }).success).toBe(false)
    expect(enquirySchema.safeParse({ ...visit, visitDate: isoInDays(400) }).success).toBe(false)
    expect(enquirySchema.safeParse({ ...visit, visitDate: '2027-02-31' }).success).toBe(false)
    // An impossible date inside the window must still be rejected.
    const soon = isoInDays(5)
    expect(enquirySchema.safeParse({ ...visit, visitDate: `${soon.slice(0, 8)}32` }).success).toBe(false)
    expect(enquirySchema.safeParse({ ...visit, visitSlot: 'midnight' }).success).toBe(false)
  })

  it('requires consent', () => {
    expect(enquirySchema.safeParse({ ...valid, consent: '' }).success).toBe(false)
  })

  it('rejects unknown topics and malformed refs', () => {
    expect(enquirySchema.safeParse({ ...valid, topic: 'admin' }).success).toBe(false)
    expect(enquirySchema.safeParse({ ...valid, ref: '../../etc/passwd' }).success).toBe(false)
  })

  it('caps message length', () => {
    expect(enquirySchema.safeParse({ ...valid, message: 'x'.repeat(2001) }).success).toBe(false)
  })
})

describe('normalisation', () => {
  it('folds compatibility characters and strips control characters', () => {
    expect(normalizeLine('Ａｓｈａ\u0000 \u0007Mehta')).toBe('Asha Mehta')
  })

  it('turns line breaks into spaces for single-line fields (header injection)', () => {
    expect(normalizeLine('asha@example.com\r\nBcc: x@evil.com')).toBe('asha@example.com Bcc: x@evil.com')
  })

  it('keeps paragraphs in multi-line text but limits blank lines', () => {
    expect(normalizeMultiline('a\r\n\r\n\r\n\r\nb')).toBe('a\n\nb')
  })

  it('reads only expected fields from form data', () => {
    const form = new FormData()
    form.set('name', 'Asha')
    form.set('isAdmin', 'true')
    expect(pickFields(form, ['name'] as const)).toEqual({ name: 'Asha' })
  })
})

describe('isSlug', () => {
  it.each(['vijay-aura-villas', 'a', '3-bhk-apartment-malviya-nagar'])('accepts %s', (value) => expect(isSlug(value)).toBe(true))
  it.each(['', '-a', 'a-', 'a--b', 'A', 'a b', '../x', 'a'.repeat(81)])('rejects %j', (value) => expect(isSlug(value)).toBe(false))
})
