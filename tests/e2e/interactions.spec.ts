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
    await page.locator('#site-menu').getByRole('link', { name: /Environmental Clearance/ }).click()
    await expect(page).toHaveURL(/\/environmental-clearance$/)
    await expect(page.locator('#site-menu')).toBeHidden()
  })
})

test.describe('mobile menu on the home page', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('closes when a link jumps to a section of the same page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.locator('#site-menu').getByRole('link', { name: /Services/ }).click()
    await expect(page.locator('#site-menu')).toBeHidden()
    await expect(page).toHaveURL(/#services$/)
  })
})

test('request a proposal opens the form on the right topic, with the message required', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Request a proposal' }).first().click()
  await expect(page.getByRole('radio', { name: 'Requesting a proposal' })).toBeChecked()
  const message = page.locator('label[for="field-message"]')
  await expect(message).not.toContainText('(optional)')
  await expect(page.getByText('Location, type of project and your timeline.')).toBeVisible()
})

test('project gallery opens a lightbox that arrows and Escape control', async ({ page }) => {
  await page.goto('/projects/liv-prime-jagatpura')
  // The count comes from the page: an admin test may add a photo while this runs.
  const all = page.getByRole('button', { name: /View all \d+ photos/ })
  const count = Number((await all.textContent())?.match(/\d+/)?.[0])
  await all.click()
  const dialog = page.getByRole('dialog', { name: /photos/ })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(`1 / ${count}`)
  await page.keyboard.press('ArrowRight')
  await expect(dialog).toContainText(`2 / ${count}`)
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog).toContainText(`${count} / ${count}`)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('EMI calculator recalculates as the visitor changes the inputs', async ({ page }) => {
  await page.goto('/projects/liv-prime-jagatpura#emi')
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
  await expect(page.getByRole('heading', { level: 2, name: 'Liv Prime' })).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Project status' }).getByRole('link', { name: 'Under construction' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Liv Prime' })).toBeVisible()
})

test('projects show plans and sizes, never a price', async ({ page }) => {
  await page.goto('/projects/liv-prime-jagatpura')
  await expect(page.getByRole('heading', { level: 1, name: 'Liv Prime, Jagatpura' })).toBeVisible()
  const units = page.getByRole('table', { name: /every unit at Liv Prime/ })
  await expect(units.getByRole('row')).toHaveCount(18)
  await expect(units).toContainText('1,656.95')
  await expect(page.getByRole('link', { name: /Open in Google Maps/ })).toHaveAttribute('href', /Ram%20Nagariya%20Road/)
  for (const path of ['/', '/projects', '/projects/liv-prime-jagatpura']) {
    await page.goto(path)
    // The EMI calculator works in rupees; everything else on these pages must be price-free.
    const text = await page.locator('main').evaluate((main) => {
      const copy = main.cloneNode(true) as HTMLElement
      copy.querySelector('#emi')?.remove()
      return copy.textContent ?? ''
    })
    expect(text, path).not.toMatch(/Starting from|₹|Price on request/)
  }
})

test('the villas page shows the plan, the film and a call button', async ({ page }) => {
  await page.goto('/projects/villas-near-skit-college-jagatpura')
  await expect(page.getByRole('heading', { level: 1, name: 'Villas near SKIT College, Jagatpura' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Call +91 77372 09850' })).toHaveAttribute('href', 'tel:+917737209850')
  await expect(page.getByText('JDA approved').first()).toBeVisible()
  await expect(page.getByRole('img', { name: /Floor plans of the 18 × 35 villa/ })).toBeVisible()

  // The film loads only near the viewport, then plays muted.
  const film = page.locator('#film video')
  await expect(film.locator('source')).toHaveCount(0)
  await page.locator('#film').scrollIntoViewIfNeeded()
  await expect(film.locator('source')).toHaveAttribute('src', /villas-skit-film\.mp4$/)
  await expect(page.locator('#film')).toContainText('What the video shows')
})
