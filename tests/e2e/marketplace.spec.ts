import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { uniqueClientIp } from './fixtures'

const ADMIN = { email: 'admin@example.com', password: 'e2e-admin-password' }

// A 1×1 PNG: enough to exercise the upload path.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
const photo = (name: string) => ({ name, mimeType: 'image/png', buffer: PNG })

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': uniqueClientIp() })
})

type Mail = Readonly<{ to: readonly string[]; subject: string; text: string }>

async function mailTo(request: APIRequestContext, address: string, subject: RegExp): Promise<Mail> {
  await expect
    .poll(async () => {
      const outbox = (await (await request.get('/api/dev/outbox')).json()) as Mail[]
      return outbox.some((mail) => mail.to.includes(address) && subject.test(mail.subject))
    })
    .toBe(true)
  const outbox = (await (await request.get('/api/dev/outbox')).json()) as Mail[]
  return outbox.find((mail) => mail.to.includes(address) && subject.test(mail.subject))!
}

const linkIn = (mail: Mail, path: string) => {
  const match = mail.text.split(/\s+/).find((word) => word.startsWith('http') && word.includes(path))
  expect(match, `link to ${path}`).toBeDefined()
  // Emails use SITE_URL; tests run on their own port.
  const url = new URL(match!)
  return `${url.pathname}${url.search}`
}

async function submitListing(page: Page, title: string, email: string, description = 'East facing villa on a thirty foot road, with clear papers and a covered parking.') {
  await page.goto('/marketplace/sell')
  await page.getByLabel('Property type').selectOption('villa')
  await page.getByLabel('Listing title').fill(title)
  await page.getByLabel('Description').fill(description)
  await page.getByLabel('Price (₹)').fill('45,00,000')
  await page.getByLabel('Area', { exact: true }).fill('200')
  await page.getByLabel('Bedrooms').selectOption('3')
  await page.getByLabel('City or town').fill('Jaipur')
  await page.getByLabel('Locality or area').fill('Jagatpura')
  // More than one photo at a time.
  await page.getByLabel('Choose photos').setInputFiles([photo('front.png'), photo('side.png'), photo('garden.png')])
  await expect(page.getByText('3 added')).toBeVisible()
  await page.getByLabel('Your name').fill('Asha Mehta')
  await page.getByLabel('Mobile number').fill('98290 12345')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email)
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Submit for review' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'check your email' })).toBeVisible()
}

async function signIn(page: Page) {
  await page.goto('/admin/login')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(ADMIN.email)
  await page.getByLabel('Password').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  // Generous: pages sharing one headless browser render slowly while the whole suite runs in parallel.
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible({ timeout: 30_000 })
}

test('a listing stays hidden until an admin approves it, and everyone is told', async ({ page, request }) => {
  const title = `Corner villa near park ${Date.now()}`
  const email = `seller-${Date.now()}@example.com`
  await submitListing(page, title, email)

  // Not public before confirmation, and not in the admin queue either.
  await page.goto(`/marketplace?city=Jaipur`)
  await expect(page.getByText(title)).toHaveCount(0)

  const confirmMail = await mailTo(request, email, /Confirm your listing/)
  // Opening the link alone must not confirm: mail scanners follow links.
  await page.goto(linkIn(confirmMail, '/marketplace/confirm'))
  await expect(page.getByRole('button', { name: 'Confirm my listing' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm my listing' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'with our team' })).toBeVisible()

  // The seller and the admins both hear about it.
  await mailTo(request, email, /We have your listing/)
  const review = await mailTo(request, ADMIN.email, /New listing to review: Corner villa/)
  expect(review.text).toContain(title)

  // Still hidden while it waits.
  await page.goto('/marketplace')
  await expect(page.getByText(title)).toHaveCount(0)

  await signIn(page)
  await page.goto(linkIn(review, '/admin/listings/'))
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page.getByRole('button', { name: 'Approve and publish' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Approved' })).toBeVisible()

  const approved = await mailTo(request, email, /Your listing is live/)
  const publicPath = linkIn(approved, '/marketplace/')
  await page.goto(publicPath)
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(page.getByText('₹45 L')).toBeVisible()
  // The seller's contact details never reach the public page or its structured data.
  const html = await page.content()
  expect(html).not.toContain(email)
  expect(html).not.toContain('9829012345')

  await page.goto('/marketplace')
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  expect(await (await request.get('/sitemap.xml')).text()).toContain(publicPath)
})

test('a rejected listing never appears, and the seller gets the reason', async ({ page, request }) => {
  const title = `Rejected plot on ring road ${Date.now()}`
  const email = `rejected-${Date.now()}@example.com`
  await submitListing(page, title, email)
  await page.goto(linkIn(await mailTo(request, email, /Confirm your listing/), '/marketplace/confirm'))
  await page.getByRole('button', { name: 'Confirm my listing' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'with our team' })).toBeVisible()

  const review = await mailTo(request, ADMIN.email, /New listing to review: Rejected plot/)
  await signIn(page)
  await page.goto(linkIn(review, '/admin/listings/'))
  await page.getByLabel(/Reason/).fill('The photos do not show this property.')
  await page.getByRole('button', { name: 'Reject' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Rejected' })).toBeVisible()

  const mail = await mailTo(request, email, /needs changes/)
  expect(mail.text).toContain('The photos do not show this property.')
  await page.goto('/marketplace')
  await expect(page.getByText(title)).toHaveCount(0)
})

test('the sell form flags mistakes before submitting', async ({ page }) => {
  await page.goto('/marketplace/sell')
  await page.getByRole('button', { name: 'Submit for review' }).click()
  const summary = page.getByRole('alert').filter({ hasText: 'Please check' })
  await expect(summary).toBeFocused()
  await expect(summary).toContainText('at least one photo')
  await expect(summary).toContainText('valid email')
})

test('subscribing needs a confirmation, and unsubscribing works', async ({ page, request }) => {
  const email = `reader-${Date.now()}@example.com`
  await page.goto('/')
  await page.getByLabel('Your email').fill(email)
  await page.getByRole('button', { name: 'Subscribe' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'check your inbox' })).toBeVisible()

  await page.goto(linkIn(await mailTo(request, email, /Confirm your subscription/), '/subscribe/confirm'))
  await page.getByRole('button', { name: 'Yes, subscribe me' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'You are subscribed' })).toBeVisible()

  const welcome = await mailTo(request, email, /You're subscribed/)
  await page.goto(linkIn(welcome, '/unsubscribe'))
  await expect(page.getByText(`Stop promotional emails to ${email}?`)).toBeVisible()
  await page.getByRole('button', { name: 'Unsubscribe' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'You are unsubscribed' })).toBeVisible()
})

test('an altered unsubscribe link is refused', async ({ page, request }) => {
  await page.goto('/unsubscribe?e=YUBiLmNvbQ&s=forged')
  await expect(page.getByRole('alert').filter({ hasText: 'not valid' })).toBeVisible()
  const response = await request.post('/api/unsubscribe?e=YUBiLmNvbQ&s=forged')
  expect(response.status()).toBe(400)
})

test('admin pages need a signed-in admin', async ({ page }) => {
  for (const path of ['/admin', '/admin/listings', '/admin/subscribers', '/admin/campaigns', '/admin/team', '/admin/account']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/admin\/login$/)
  }
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(ADMIN.email)
  await page.getByLabel('Password').fill('wrong-password-here')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'do not match' })).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('admins can add a colleague, send a campaign and sign out', async ({ page, request }) => {
  await signIn(page)
  const colleague = `colleague-${Date.now()}@example.com`
  await page.goto('/admin/team')
  await page.getByLabel('Name', { exact: true }).fill('Ravi Sharma')
  await page.getByLabel('Email', { exact: true }).fill(colleague)
  await page.getByLabel('First password').fill('a-long-first-password')
  await page.getByRole('button', { name: 'Add admin' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Ravi Sharma added' })).toBeVisible()
  const welcome = await mailTo(request, colleague, /You are now an admin/)
  expect(welcome.text).not.toContain('a-long-first-password')

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/admin\/login$/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test.describe('marketplace on a small phone', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  const fits = async (page: Page) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  }

  test('sell form and admin screens fit without sideways scrolling', async ({ page }) => {
    await page.goto('/marketplace')
    await fits(page)
    await page.goto('/marketplace/sell')
    await page.getByLabel('Choose photos').setInputFiles([photo('a.png'), photo('b.png')])
    await expect(page.getByText('2 added')).toBeVisible()
    await fits(page)

    await signIn(page)
    for (const path of ['/admin', '/admin/listings', '/admin/subscribers', '/admin/campaigns', '/admin/team', '/admin/account']) {
      await page.goto(path)
      await fits(page)
    }
  })
})

test('a server rejection keeps every choice in the sell form', async ({ page }) => {
  await page.goto('/marketplace/sell')
  await page.getByLabel('Property type').selectOption('apartment')
  await page.getByLabel('Sale or rent').selectOption('rent')
  // Passes the browser check, fails the server's: no markup in titles.
  await page.getByLabel('Listing title').fill('Title with <b>markup</b> in it')
  await page.getByLabel('Description').fill('A long enough description of the property for the form to accept it.')
  await page.getByLabel('Price (₹)').fill('25000')
  await page.getByLabel('Area', { exact: true }).fill('1200')
  await page.getByLabel('Area unit').selectOption('sqft')
  await page.getByLabel('Bedrooms').selectOption('2')
  await page.getByLabel('City or town').fill('Jaipur')
  await page.getByLabel('Locality or area').fill('Malviya Nagar')
  await page.getByLabel('Choose photos').setInputFiles([photo('a.png')])
  await expect(page.getByText('1 added')).toBeVisible()
  await page.getByLabel('Your name').fill('Asha Mehta')
  await page.getByLabel('Mobile number').fill('98290 12345')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(`keep-${Date.now()}@example.com`)
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Submit for review' }).click()

  await expect(page.locator('#field-title-error')).toContainText('remove')
  await expect(page.getByLabel('Property type')).toHaveValue('apartment')
  await expect(page.getByLabel('Sale or rent')).toHaveValue('rent')
  await expect(page.getByLabel('Area unit')).toHaveValue('sqft')
  await expect(page.getByLabel('Bedrooms')).toHaveValue('2')
  await expect(page.getByRole('checkbox')).toBeChecked()
  await expect(page.getByText('1 added')).toBeVisible()
})

test('marketplace filters give a clean URL and ignore junk', async ({ page }) => {
  await page.goto('/marketplace')
  await page.getByLabel('Type').selectOption('plot')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/\/marketplace\?kind=plot$/)
  await page.goto('/marketplace?kind=<script>&budget=abc&page=-1')
  await expect(page).toHaveURL(/\/marketplace$/)
})

test('a decision from a stale tab is refused', async ({ page, context, request }) => {
  const title = `Stale tab villa near lake ${Date.now()}`
  const email = `stale-${Date.now()}@example.com`
  await submitListing(page, title, email)
  await page.goto(linkIn(await mailTo(request, email, /Confirm your listing/), '/marketplace/confirm'))
  await page.getByRole('button', { name: 'Confirm my listing' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'with our team' })).toBeVisible()
  const review = await mailTo(request, ADMIN.email, /New listing to review: Stale tab/)
  await signIn(page)
  await page.goto(linkIn(review, '/admin/listings/'))
  const other = await context.newPage()
  await other.goto(page.url())
  await other.getByRole('button', { name: 'Approve and publish' }).click()
  await expect(other.getByRole('status').filter({ hasText: 'Approved' })).toBeVisible()

  await page.getByLabel(/Reason/).fill('Second admin, looking at an old page.')
  await page.getByRole('button', { name: 'Reject' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'changed since you opened it' })).toBeVisible()
  await other.close()
})

test('hostile listing text stays inert on the public page and in the admin panel', async ({ page, request }) => {
  const title = `Hostile text flat near market ${Date.now()}`
  const email = `hostile-${Date.now()}@example.com`
  const payload = '</script><script>window.__pwn=1</script><img src=x onerror="window.__pwn=1"> and enough words to pass.'
  await submitListing(page, title, email, payload)
  await page.goto(linkIn(await mailTo(request, email, /Confirm your listing/), '/marketplace/confirm'))
  await page.getByRole('button', { name: 'Confirm my listing' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'with our team' })).toBeVisible()
  await signIn(page)
  await page.goto(linkIn(await mailTo(request, ADMIN.email, /New listing to review: Hostile text/), '/admin/listings/'))
  await expect(page.getByText(payload)).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined()
  await page.getByRole('button', { name: 'Approve and publish' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Approved' })).toBeVisible()
  await page.goto(linkIn(await mailTo(request, email, /Your listing is live/), '/marketplace/'))
  await expect(page.getByText(payload)).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined()
})

test.describe('accessibility beyond the public pages', () => {
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
  const violations = async (page: Page) => {
    const results = await new AxeBuilder({ page }).withTags(tags).analyze()
    return results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`)
  }

  for (const width of [1440, 390]) {
    test(`admin screens and confirmation pages @${width}px`, async ({ page }) => {
      // Eleven full-page scans in one signed-in session.
      test.setTimeout(180_000)
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      for (const path of ['/admin/login', '/marketplace/confirm', '/subscribe/confirm', '/unsubscribe']) {
        await page.goto(path)
        expect(await violations(page), path).toEqual([])
      }
      await page.goto('/marketplace/sell')
      await page.getByRole('button', { name: 'Submit for review' }).click()
      await expect(page.getByRole('alert').filter({ hasText: 'Please check' })).toBeVisible()
      expect(await violations(page), 'sell form with errors').toEqual([])

      await signIn(page)
      for (const path of ['/admin', '/admin/listings', '/admin/subscribers', '/admin/campaigns', '/admin/team', '/admin/account']) {
        await page.goto(path)
        expect(await violations(page), path).toEqual([])
      }
    })
  }
})
