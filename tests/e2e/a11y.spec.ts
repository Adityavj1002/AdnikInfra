import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { pages } from './fixtures'

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

for (const width of [1440, 390]) {
  test.describe(`accessibility @${width}px`, () => {
    for (const { path } of pages) {
      test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(path)
        const results = await new AxeBuilder({ page }).withTags(tags).analyze()
        const summary = results.violations.map(
          (v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(' ')}`,
        )
        expect(summary).toEqual([])
      })
    }
  })
}

test('the 404 page is accessible and returns a real 404 status', async ({ page }) => {
  const response = await page.goto('/projects/no-such-project')
  expect(response?.status()).toBe(404)
  const results = await new AxeBuilder({ page }).withTags(tags).analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])
})

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/projects')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await skip.press('Enter')
  await expect(page.locator('main#main')).toBeFocused()
})
