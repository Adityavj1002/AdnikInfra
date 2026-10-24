import { expect, test } from '@playwright/test'
import { pages, viewports } from './fixtures'

test.describe('responsive layout', () => {
  for (const { path } of pages) {
    test(`${path} never scrolls sideways, on any device`, async ({ page }) => {
      // One full page load per device: budget scales with the device list, not a flat 30s.
      test.setTimeout(viewports.length * 10_000)
      const problems: string[] = []
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(path)
        const overflow = await page.evaluate(() => {
          const width = document.documentElement.clientWidth
          if (document.documentElement.scrollWidth <= width) return null
          // Name the culprits to make failures actionable.
          const culprits = [...document.querySelectorAll<HTMLElement>('body *')]
            .filter((el) => el.getBoundingClientRect().right > width + 1)
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`)
          return `${document.documentElement.scrollWidth}px > ${width}px (${culprits.join(', ')})`
        })
        if (overflow) problems.push(`${viewport.name}: ${overflow}`)
      }
      expect(problems).toEqual([])
    })
  }
})

test.describe('touch targets', () => {
  for (const width of [280, 390]) {
    for (const { path } of pages) {
      test(`${path} @${width}px: controls are big enough to tap`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await page.goto(path)
        const small = await page.evaluate(() => {
          const isVisible = (el: Element) => {
            const rect = el.getBoundingClientRect()
            const style = getComputedStyle(el)
            return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden' && !el.closest('[aria-hidden="true"]')
          }
          const failures: string[] = []
          for (const el of document.querySelectorAll('a[href], button, select, textarea, input:not([type="hidden"]), summary')) {
            if (!isVisible(el)) continue
            // WCAG 2.5.8 exempts links inside running text; the label is the target for radios/checkboxes.
            if (el.matches('a') && el.closest('p, .prose, dd, figcaption') && getComputedStyle(el).display === 'inline') continue
            const target = el.matches('input[type="radio"], input[type="checkbox"]') ? el.closest('label') ?? el : el
            const rect = target.getBoundingClientRect()
            const primary = el.matches('.button, .chip, button, select, textarea, input')
            const min = primary ? 44 : 24
            if (rect.height < min - 0.5 || rect.width < 24 - 0.5) {
              failures.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(rect.width)}×${Math.round(rect.height)}`)
            }
          }
          return failures
        })
        expect(small).toEqual([])
      })
    }
  }
})
