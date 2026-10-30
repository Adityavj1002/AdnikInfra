import { expect, test } from '@playwright/test'

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens as a full-screen sheet and closes on Escape', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const sheet = page.locator('#site-menu')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByRole('link', { name: /Projects/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })

  test('closes after navigating', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.locator('#site-menu').getByRole('link', { name: /Real estate|Buy property/i }).click()
    await expect(page).toHaveURL(/\/properties$/)
    await expect(page.locator('#site-menu')).toBeHidden()
  })
})

test('project gallery opens a lightbox that arrows and Escape control', async ({ page }) => {
  await page.goto('/projects/vijay-aura-villas')
  await page.getByRole('button', { name: /View all 6 photos/ }).click()
  const dialog = page.getByRole('dialog', { name: /photos/ })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('1 / 6')
  await page.keyboard.press('ArrowRight')
  await expect(dialog).toContainText('2 / 6')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog).toContainText('6 / 6')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('EMI calculator recalculates as the visitor changes the inputs', async ({ page }) => {
  await page.goto('/projects/vijay-aura-villas#emi')
  const emi = page.locator('#emi').getByText('Your monthly EMI').locator('xpath=following-sibling::p[1]')
  const before = await emi.textContent()
  const tenure = page.getByRole('slider', { name: 'Loan tenure' })
  await tenure.focus()
  await page.keyboard.press('Home')
  await expect(page.locator('#emi')).toContainText('5 years')
  expect(await emi.textContent()).not.toBe(before)
})

test('construction estimator updates the estimate instantly', async ({ page }) => {
  await page.goto('/construction#estimate')
  const section = page.locator('#estimate')
  await section.getByLabel('Built-up area per floor (sq ft)').fill('1000')
  await section.getByRole('radio', { name: 'G+1' }).check()
  await section.getByRole('radio', { name: /Standard/ }).check()
  await expect(section).toContainText('Estimated cost for 2,000 sq ft')
  await expect(section).toContainText('₹33,00,000')
})

test('property search submits a shareable filtered results page', async ({ page }) => {
  await page.goto('/properties')
  const search = page.getByRole('search', { name: /Search (real estate|properties)/i })
  await search.getByLabel(/(Real estate|Property) type/i).selectOption('apartment')
  await search.getByLabel('Budget').selectOption('1cr')
  await search.getByRole('button', { name: 'Search' }).click()
  // Empty filters are dropped, so the shared URL is clean.
  await expect(page).toHaveURL(/\/properties\?type=apartment&budget=1cr$/)
  await expect(page.getByText(/(real estate listings?|properties?) found/i)).toBeVisible()
  // Filtered views must not be indexed.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('unknown filter values are ignored, never reflected', async ({ page }) => {
  await page.goto('/properties?type=<script>&budget=999&sort=drop-table')
  await expect(page.locator('body')).not.toContainText('<script>')
  await expect(page.getByText(/(real estate listings?|properties?) found/i)).toBeVisible()
})

test('project status tabs filter the list', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('navigation', { name: 'Project status' }).getByRole('link', { name: 'Completed' }).click()
  await expect(page).toHaveURL(/status=completed/)
  await expect(page.getByRole('heading', { level: 2, name: 'Vijay Courtyard Homes' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Vijay Aura Villas' })).toHaveCount(0)
})
