import { describe, expect, it } from 'vitest'
import { recordSchema, toProject } from '@/features/projects/content'
import { facts, homes, nearby, paragraphs, specifications, units, updates } from '@/features/projects/text'
import { toSlug } from '@/lib/slug'
import { seedProjects, seedRecords } from './seed-projects'

const { record: seeded } = seedRecords[0]!
const villas = seedRecords[1]!.record
const geo = { lat: 26.82, lng: 75.86 }

describe('project editor text', () => {
  it('reads what it writes, for every list', () => {
    const record = seeded
    expect(updates.parse(updates.format(villas.updates))).toEqual({ ok: true, value: villas.updates })
    expect(homes.parse(homes.format(record.configurations))).toEqual({ ok: true, value: record.configurations })
    expect(facts.parse(facts.format(record.facts))).toEqual({ ok: true, value: record.facts })
    expect(nearby.parse(nearby.format(record.nearby))).toEqual({ ok: true, value: record.nearby })
    expect(units.parse(units.format(record.units))).toEqual({ ok: true, value: record.units })
    expect(specifications.parse(specifications.format(record.specifications))).toEqual({ ok: true, value: record.specifications })
    expect(paragraphs.parse(paragraphs.format(record.description))).toEqual(record.description)
  })

  it('accepts commas, units and blank lines the way people type them', () => {
    expect(units.parse('\n101 / 501 | 3 BHK | 960.68 | 1,175.72 | 1,646 sq ft\n\n')).toEqual({
      ok: true,
      value: [{ unit: '101 / 501', bhk: 3, carpet: 960.68, builtUp: 1175.72, superBuiltUp: 1646 }],
    })
    expect(nearby.parse('SKIT College | 0.3 km')).toEqual({ ok: true, value: [{ place: 'SKIT College', km: 0.3 }] })
    expect(homes.parse('Penthouse | 2,400')).toEqual({ ok: true, value: [{ label: 'Penthouse', from: 2400 }] })
  })

  it('leaves out what a brochure does not give: carpet areas and distances', () => {
    expect(units.parse('106 / 606 | 2 | - | 826.35 | 1,156.89')).toEqual({ ok: true, value: [{ unit: '106 / 606', bhk: 2, builtUp: 826.35, superBuiltUp: 1156.89 }] })
    expect(nearby.parse('Suresh Gyan Vihar University')).toEqual({ ok: true, value: [{ place: 'Suresh Gyan Vihar University' }] })
    expect(units.format([{ unit: '106', bhk: 2, builtUp: 826.35, superBuiltUp: 1156.89 }])).toBe('106 | 2 | - | 826.35 | 1156.89')
    expect(updates.parse('04-11-2026 | Plaster done')).toMatchObject({ ok: false })
  })

  it('makes a web address from a project name', () => {
    expect(toSlug('Liv Gyan, Jagatpura')).toBe('liv-gyan-jagatpura')
    expect(toSlug('  18 × 35 Villas — SKIT ')).toBe('18-35-villas-skit')
  })

  it('names the line that does not parse', () => {
    expect(units.parse('101 | 3 | 1 | 2 | 3\n102 | three | 1 | 2 | 3')).toEqual({
      ok: false,
      message: `Unit-wise areas, line 2: please write it as ${units.shape}.`,
    })
    expect(homes.parse('2 BHK | 1200 | 900')).toMatchObject({ ok: false })
    expect(specifications.parse('Structure')).toMatchObject({ ok: false })
  })
})

describe('project records', () => {
  it('seeds a fresh database with valid records, nothing in the code', () => {
    expect(seedRecords.map((p) => p.slug)).toEqual(['liv-prime-jagatpura', 'villas-near-skit-college-jagatpura', 'liv-gyan-jagatpura'])
    expect(seedProjects[0]!.stage).toBe('Finishing stage')
  })

  it('renders a record with Cloudinary photos, plans and film', () => {
    const project = toProject('villas', villas, '2026-11-05T10:00:00Z', geo)
    expect(project.gallery[0]!.src.src).toMatch(/^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/adnik\/projects\/villas-skit\/villa-front$/)
    expect(project.plans).toHaveLength(1)
    expect(project.film?.sources[0]!.src).toMatch(/\/video\/upload\/q_auto\/adnik\/media\/villas-skit-film\.mp4$/)
    expect(project.film?.portrait).toBe(true)
    expect(project.updatedAt).toBe('2026-11-05')
    expect(project.rera).toBeNull()
  })

  it('rejects photo and video references it did not issue', () => {
    expect(recordSchema.safeParse({ ...seeded, photos: [{ ref: 'https://evil.example/x.jpg', alt: 'A photo', width: 10, height: 10 }] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...villas, film: { ...villas.film, video: 'someone/else' } }).success).toBe(false)
    expect(toProject('x', { ...seeded, photos: [{ ref: 'cloud:other/folder/x', alt: 'A photo', width: 10, height: 10 }] }, '2026-11-05', geo).gallery).toEqual([])
  })
})

describe('images on Cloudinary', () => {
  it('lists every bundled image, so none is left on this server by mistake', async () => {
    const { readdirSync } = await import('node:fs')
    const { cloudImages } = await import('@/lib/cloud-images')
    const names = ['src/assets/images', 'public/brand'].flatMap((dir) =>
      readdirSync(dir)
        .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
        .map((file) => file.replace(/\.[^.]+$/, '')),
    )
    expect(names.filter((name) => !cloudImages[name])).toEqual([])
  })

  it('maps bundled and uploaded images to Cloudinary sizes, and leaves others alone', async () => {
    process.env.NEXT_PUBLIC_IMAGE_CLOUD = 'demo'
    const { default: loader } = await import('@/lib/image-loader')
    expect(loader({ src: '/_next/static/media/hero-villa-pool.3yis7a6mpvu6l.jpg', width: 640 })).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_640/adnik/site/hero-villa-pool',
    )
    expect(loader({ src: '/brand/naigrowth-logo.png', width: 48 })).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_48/adnik/site/naigrowth-logo')
    expect(loader({ src: 'https://res.cloudinary.com/demo/image/upload/adnik/marketplace/abc', width: 828 })).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_828/adnik/marketplace/abc',
    )
    expect(loader({ src: '/api/marketplace/dev-media/dev/x', width: 828 })).toBe('/api/marketplace/dev-media/dev/x')
  })
})
