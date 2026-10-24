import { expect, test } from '@playwright/test'
import { uniqueClientIp } from './fixtures'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': uniqueClientIp() })
})

const nameField = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Full name' })
const phoneField = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Mobile number' })

test('contact: errors are summarised, focused and linked to their fields', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  const summary = page.getByRole('alert').filter({ hasText: 'Please check' })
  await expect(summary).toBeVisible()
  await expect(summary).toBeFocused()

  await summary.getByRole('link', { name: /Full name/ }).click()
  await expect(nameField(page)).toBeFocused()
  await expect(nameField(page)).toHaveAttribute('aria-invalid', 'true')
})

test('contact: keeps what was typed after an error', async ({ page }) => {
  await page.goto('/contact')
  await nameField(page).fill('Asha Mehta')
  await phoneField(page).fill('12345')
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Please check' })).toContainText('valid mobile number')
  await expect(nameField(page)).toHaveValue('Asha Mehta')
  await expect(phoneField(page)).toHaveValue('12345')
})

test('contact: a valid enquiry gets a reference and next steps', async ({ page }) => {
  await page.goto('/contact?topic=construction')
  await expect(page.getByRole('radio', { name: 'Building on my plot' })).toBeChecked()
  await nameField(page).fill('आशा मेहता')
  await phoneField(page).fill('98290 12345')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  const status = page.getByRole('status')
  await expect(status).toContainText('Thank you, आशा.')
  await expect(status).toContainText(/VB-[A-Z2-9]{6}/)
})

test('contact: choosing "site visit" reveals the date fields (pure CSS, no JS needed)', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.getByLabel(/Preferred date/)).toBeHidden()
  await page.getByRole('radio', { name: 'Booking a site visit' }).check()
  await expect(page.getByLabel(/Preferred date/)).toBeVisible()
})

test('contact: deep links name the project and ignore junk parameters', async ({ page }) => {
  await page.goto('/contact?topic=site-visit&ref=vijay-aura-villas')
  await expect(page.getByText('Enquiring about Vijay Aura Villas')).toBeVisible()

  await page.goto('/contact?topic=<script>&ref=../../etc/passwd')
  await expect(page.getByText(/Enquiring about/)).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('<script>')
})

test('project page: the site-visit card books a visit', async ({ page }) => {
  await page.goto('/projects/vijay-skyline-residences')
  const card = page.getByRole('complementary', { name: 'Book a free site visit' })
  await card.getByRole('textbox', { name: 'Full name' }).fill('Ravi Sharma')
  await card.getByRole('textbox', { name: 'Mobile number' }).fill('+91 98290 12345')
  await card.getByRole('combobox', { name: /Preferred time/ }).selectOption('evening')
  await card.getByRole('checkbox').check()
  await card.getByRole('button', { name: 'Book a free site visit' }).click()
  await expect(card.getByRole('status')).toContainText(/VB-[A-Z2-9]{6}/)
  await expect(card.getByRole('status')).toContainText('confirm the date')
})

test('forms work without JavaScript (progressive enhancement)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, extraHTTPHeaders: { 'x-forwarded-for': uniqueClientIp() } })
  const page = await context.newPage()
  await page.goto('/contact')
  await nameField(page).fill('Asha Mehta')
  await phoneField(page).fill('9829012345')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByRole('status')).toContainText(/VB-[A-Z2-9]{6}/)
  await context.close()
})
