import { expect, test } from '@playwright/test'
import { pages } from './fixtures'

test.describe('on-page SEO', () => {
  for (const { path, keyword } of pages) {
    test(`${path}: one H1 with its keyword, sound title, description, canonical and social tags`, async ({ page }) => {
      await page.goto(path)

      const h1s = page.locator('h1')
      await expect(h1s).toHaveCount(1)
      expect((await h1s.innerText()).toLowerCase().replace(/\s+/g, ' ')).toContain(keyword)

      const title = await page.title()
      expect(title.length).toBeGreaterThan(10)
      expect(title.length).toBeLessThanOrEqual(60)

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0).toBeGreaterThanOrEqual(50)
      expect(description?.length ?? 0).toBeLessThanOrEqual(160)

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toMatch(/^https?:\/\//)
      expect(canonical).not.toContain('?')

      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
      await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /opengraph-image/)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')

      // Headings never skip a level (h2 → h4).
      const levels = await page.locator('main h1, main h2, main h3, main h4').evaluateAll((els) =>
        els.map((el) => Number(el.tagName[1])),
      )
      const skips = levels.filter((level, i) => i > 0 && level > (levels[i - 1] ?? 1) + 1)
      expect(skips).toEqual([])

      // Every JSON-LD block parses and uses the schema.org context.
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(blocks.length).toBeGreaterThan(0)
      for (const block of blocks) {
        const data = JSON.parse(block) as { '@context': string; '@graph': unknown[] }
        expect(data['@context']).toBe('https://schema.org')
        expect(Array.isArray(data['@graph'])).toBe(true)
      }

      // Every image has an alt attribute (empty is allowed only for decorative images).
      const missingAlt = await page.locator('img:not([alt])').count()
      expect(missingAlt).toBe(0)
    })
  }

  test('titles are unique across the site', async ({ page }) => {
    const titles: string[] = []
    for (const { path } of pages) {
      await page.goto(path)
      titles.push(await page.title())
    }
    expect(new Set(titles).size).toBe(titles.length)
  })

  test('filtered project lists stay out of the index and point to the full list', async ({ page }) => {
    await page.goto('/projects?status=ongoing')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/\/projects$/)
  })

  test('robots.txt and sitemap.xml are served and list every template', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Sitemap:')
    expect(robots).toContain('Disallow: /api/')
    const sitemap = await (await request.get('/sitemap.xml')).text()
    for (const { path } of pages) {
      if (path === '/') continue
      expect(sitemap, `sitemap is missing ${path}`).toContain(`${path}</loc>`)
    }
  })

  test('share images render as PNG', async ({ request }) => {
    for (const path of ['/opengraph-image', '/projects/vijay-aura-villas/opengraph-image', '/properties/3-bhk-apartment-malviya-nagar/opengraph-image']) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect(response.headers()['content-type']).toBe('image/png')
    }
  })
})
