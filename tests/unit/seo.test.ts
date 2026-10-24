import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { packages, posts } from '@/content/fixtures/company'
import { localities } from '@/content/fixtures/localities'
import { projects } from '@/content/fixtures/projects'
import { properties } from '@/content/fixtures/properties'
import { localityKeywords, postKeywords, projectKeywords, propertyKeywords, staticKeywords } from '@/seo/keywords'
import { safeJsonLd } from '@/seo/safe-json-ld'
import {
  breadcrumbNode,
  constructionServiceNode,
  graph,
  localityNode,
  projectNode,
  propertyNode,
  siteNodes,
} from '@/seo/schema'
import { buildTitle, TITLE_MAX } from '@/seo/titles'

const localityOf = (slug: string) => localities.find((l) => l.slug === slug)!
const SEPARATORS = String.fromCharCode(0x2028) + String.fromCharCode(0x2029)

describe('buildTitle', () => {
  it('keeps the locality and city when they fit', () => {
    expect(buildTitle({ name: 'Vijay Greens', location: 'Ajmer Road' }).title).toBe('Vijay Greens, Ajmer Road, Jaipur | Vijay Builders')
  })

  it('steps down the ladder instead of being cut off, keeping the locality where possible', () => {
    const { title, socialTitle } = buildTitle({ name: 'Vijay Skyline Residences', location: 'Vaishali Nagar' })
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX)
    expect(title).toBe('Vijay Skyline Residences, Vaishali Nagar | Vijay Builders')
    expect(socialTitle).toContain('Jaipur')
  })

  it('clips very long names at a word boundary', () => {
    const { title } = buildTitle({ name: 'A really '.repeat(10) + 'long project name' })
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX)
    expect(title.endsWith('…')).toBe(true)
  })

  it('keeps every project title within the limit', () => {
    for (const project of projects) {
      const { title } = buildTitle({ name: project.name, location: localityOf(project.localitySlug).name })
      expect(title.length, title).toBeLessThanOrEqual(TITLE_MAX)
    }
  })
})

describe('keyword ownership', () => {
  it('assigns every primary keyword to exactly one URL', () => {
    const primaries = [
      ...Object.values(staticKeywords).map((k) => k.primary),
      ...localities.map((l) => localityKeywords(l).primary),
      ...projects.map((p) => projectKeywords(p, localityOf(p.localitySlug)).primary),
      ...properties.map((p) => propertyKeywords(p).primary),
      ...posts.map((p) => postKeywords(p).primary),
    ].map((p) => p.toLowerCase())
    expect(primaries.filter((p, i) => primaries.indexOf(p) !== i)).toEqual([])
  })

  it('targets the high-intent Jaipur searches', () => {
    const all = JSON.stringify(staticKeywords).toLowerCase()
    for (const target of [
      'builders in jaipur',
      'real estate developers in jaipur',
      'property for sale in jaipur',
      'new residential projects in jaipur',
      'home construction company in jaipur',
      'house construction cost per sq ft in jaipur',
      'modular homes jaipur',
      'villas for sale in jaipur',
      'plots for sale in jaipur',
    ]) {
      expect(all).toContain(target)
    }
  })
})

describe('meta descriptions', () => {
  it('site description fits a search snippet (50–160 chars)', () => {
    expect(site.description.length).toBeGreaterThanOrEqual(50)
    expect(site.description.length).toBeLessThanOrEqual(160)
  })

  it.each([
    ...projects.map((p) => [p.slug, p.summary] as const),
    ...properties.map((p) => [p.slug, p.summary] as const),
    ...localities.map((l) => [l.slug, l.summary] as const),
    ...posts.map((p) => [p.slug, p.summary] as const),
  ])('%s summary works as a meta description', (_slug, summary) => {
    expect(summary.length).toBeGreaterThanOrEqual(50)
    expect(summary.length).toBeLessThanOrEqual(160)
  })
})

describe('content honesty', () => {
  it('never invents RERA numbers in sample data', () => {
    expect(projects.every((p) => p.rera === null)).toBe(true)
  })

  it('every listing points at a real locality', () => {
    for (const item of [...projects, ...properties]) expect(localityOf(item.localitySlug), item.slug).toBeDefined()
  })

  it('every image has meaningful alt text', () => {
    for (const img of [...projects, ...properties].flatMap((item) => item.gallery)) {
      expect(img.alt.length).toBeGreaterThan(15)
      expect(img.alt.toLowerCase()).not.toMatch(/^(image|photo|picture) of/)
    }
  })
})

describe('safeJsonLd', () => {
  it('cannot be used to close the script element', () => {
    const out = safeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
  })

  it('escapes comment openers, ampersands and JS line terminators', () => {
    const out = safeJsonLd({ a: '<!--', b: 'R&D', c: `x${SEPARATORS}y` })
    for (const char of ['<', '>', '&', ...SEPARATORS]) expect(out).not.toContain(char)
  })

  it('stays valid JSON that round-trips exactly', () => {
    const data = { name: 'Villa <A> & B', line: `a${SEPARATORS}b` }
    expect(JSON.parse(safeJsonLd(data))).toEqual(data)
  })
})

describe('JSON-LD graph integrity', () => {
  const nodes = [
    ...siteNodes(),
    ...localities.map(localityNode),
    ...projects.map((p) => projectNode(p, localityOf(p.localitySlug))),
    ...properties.map(propertyNode),
    constructionServiceNode(packages),
    breadcrumbNode('/projects', [
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects' },
    ]),
  ]
  const json = JSON.stringify(graph(...nodes))
  const defined = new Set([...json.matchAll(/"@id":"([^"]+)"/g)].map((m) => m[1]))

  it('uses only real schema.org types (no "ConstructionBusiness")', () => {
    expect(json).not.toContain('ConstructionBusiness')
    for (const type of ['GeneralContractor', 'RealEstateAgent', 'RealEstateListing', 'City', 'Place', 'Service', 'AggregateOffer']) {
      expect(json).toContain(`"@type":"${type}"`)
    }
  })

  it('every place a listing points to is defined in the graph', () => {
    const references = [...json.matchAll(/\{"@id":"([^"]+#(?:place|jaipur))"\}/g)].map((m) => m[1])
    expect(references.filter((id) => !defined.has(id))).toEqual([])
  })

  it('never claims business details that are not configured', () => {
    if (!site.business.address) expect(json).not.toContain('"streetAddress"')
    if (!site.contact.phone) expect(json).not.toContain('"telephone"')
  })

  it('prices projects as an AggregateOffer range', () => {
    const villa = projectNode(projects[0]!, localityOf(projects[0]!.localitySlug)) as unknown as {
      offers: { lowPrice: number; highPrice: number }
    }
    expect(villa.offers.lowPrice).toBeLessThan(villa.offers.highPrice)
  })
})
