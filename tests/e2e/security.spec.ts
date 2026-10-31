import { expect, test } from '@playwright/test'
import { pages } from './fixtures'

test.describe('security in the browser', () => {
  for (const { path } of pages) {
    test(`${path}: zero CSP violations, sound markup`, async ({ page }) => {
      await page.addInitScript(() => {
        ;(window as unknown as { __csp: string[] }).__csp = []
        document.addEventListener('securitypolicyviolation', (event) => {
          ;(window as unknown as { __csp: string[] }).__csp.push(`${event.effectiveDirective} ← ${event.blockedURI}`)
        })
      })
      const response = await page.goto(path)
      const headers = response?.headers() ?? {}
      expect(headers['content-security-policy'] ?? headers['content-security-policy-report-only']).toContain("'strict-dynamic'")

      // Let lazy islands, fonts and images settle, then check.
      await page.mouse.wheel(0, 4000)
      await page.waitForTimeout(500)
      const violations = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)
      expect(violations).toEqual([])

      const html = await page.content()
      expect(html, 'inline event handler attribute').not.toMatch(/\son[a-z]+="/i)
      expect(html, 'javascript: URL').not.toMatch(/href="javascript:/i)

      // The cascade-layer order must be declared before any other CSS (a wrong order silently
      // breaks every button's colour, see layout.tsx).
      const firstLayerStatement = await page.evaluate(() => {
        for (const sheet of document.styleSheets) {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSLayerStatementRule) return rule.nameList.join(',')
            if (rule instanceof CSSLayerBlockRule) return `block:${rule.name}`
          }
        }
        return null
      })
      expect(firstLayerStatement).toBe('reset,tokens,base,layout,components,utilities')
    })
  }

  test('pages refuse methods they have no use for', async ({ request }) => {
    for (const method of ['put', 'delete', 'patch'] as const) {
      expect((await request[method]('/')).status(), method).toBe(405)
    }
  })

  test('/sectors leads to the sectors section', async ({ request }) => {
    const response = await request.get('/sectors', { maxRedirects: 0 })
    expect(response.status()).toBe(307)
    expect(response.headers().location).toBe('/#sectors')
  })

  test('external links cannot reach back into the page', async ({ page }) => {
    await page.goto('/')
    const unsafe = await page.locator('a[target="_blank"]:not([rel*="noopener"])').count()
    expect(unsafe).toBe(0)
  })
})
