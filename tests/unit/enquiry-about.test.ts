import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getProjects, getProperties, getTowns } from '@/content/repository'
import { services } from '@/content/services'
import { resolveEnquiryAbout } from '@/features/enquiry/about'
import { isSlug } from '@/lib/slug'

// Paths come from walking this repo's own src/ folder, never from input.
/* eslint-disable security/detect-non-literal-fs-filename */
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(dir, entry.name)] : [],
  )

describe('enquiry deep links', () => {
  it('name the project, listing, town or service they came from', async () => {
    expect(await resolveEnquiryAbout('vijay-aura-villas')).toEqual({ slug: 'vijay-aura-villas', name: 'Vijay Aura Villas' })
    expect((await resolveEnquiryAbout('chaksu'))?.name).toBe('Chaksu, near Jaipur')
    expect((await resolveEnquiryAbout('construction-advisory'))?.name).toBe('Construction Advisory')
    expect(await resolveEnquiryAbout('not-a-thing')).toBeUndefined()
    expect(await resolveEnquiryAbout(undefined)).toBeUndefined()
  })

  it('resolve for every project, listing, town and service', async () => {
    const slugs = [
      ...(await getProjects()).map((p) => p.slug),
      ...(await getProperties()).map((p) => p.slug),
      ...(await getTowns()).map((t) => t.slug),
      ...services.map((s) => s.slug),
    ]
    for (const slug of slugs) expect(await resolveEnquiryAbout(slug), slug).toBeDefined()
  })

  // A display name ("Chaksu", "Warehouse Construction") is not a slug: the contact page would
  // drop it and the lead would arrive without saying what it was about.
  it('only ever pass a slug as the reference', () => {
    const offenders = walk('src')
      .filter((file) => !file.endsWith(join('lib', 'routes.ts')))
      .flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/contactHref\([^,)]+,\s*([^)]+)\)/g)].map((m) => `${file}: ${m[1]}`))
      .filter((call) => {
        const arg = call.split(': ')[1]!.trim()
        const literal = arg.match(/^'([^']*)'$/)
        return literal ? !isSlug(literal[1]!) : !/\.slug$/.test(arg)
      })
    expect(offenders).toEqual([])
  })
})
/* eslint-enable security/detect-non-literal-fs-filename */
