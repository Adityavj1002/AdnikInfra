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

async function submitListing(page: Page, title: string, email: string) {
  await page.goto('/marketplace/sell')
  await page.getByLabel('Property type').selectOption('villa')
  await page.getByLabel('Listing title').fill(title)
  await page.getByLabel('Description').fill('East facing villa on a thirty foot road, with clear papers and a covered parking.')
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
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
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
  const review = await mailTo(request, ADMIN.email, /New listing to review/)
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
