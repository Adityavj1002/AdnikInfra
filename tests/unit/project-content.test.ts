import { describe, expect, it } from 'vitest'
import { projects } from '@/content/fixtures/projects'
import { applyRecord, recordSchema, toRecord } from '@/features/projects/content'
import { facts, homes, nearby, paragraphs, specifications, units } from '@/features/projects/text'

const project = projects[0]!

describe('project editor text', () => {
  it('reads what it writes, for every list', () => {
    const record = toRecord(project)
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
  it('describes the bundled project as a valid record', () => {
    expect(recordSchema.safeParse(toRecord(project)).success).toBe(true)
  })

  it('applies an edit without losing the bundled photos or plans', () => {
    const record = { ...toRecord(project), tagline: 'Homes beside SKIT College', amenities: ['pool' as const] }
    const edited = applyRecord(project, record, '2026-11-05T10:00:00Z')
    expect(edited.tagline).toBe('Homes beside SKIT College')
    expect(edited.amenities).toEqual(['pool'])
    expect(edited.gallery.map((img) => img.src)).toEqual(project.gallery.map((img) => img.src))
    expect(edited.plans).toBe(project.plans)
    expect(edited.updatedAt).toBe('2026-11-05')
  })

  it('rejects photo references it did not issue', () => {
    const record = { ...toRecord(project), photos: [{ ref: 'https://evil.example/x.jpg', alt: 'A photo', width: 10, height: 10 }] }
    expect(recordSchema.safeParse(record).success).toBe(false)
  })
})

describe('images on Cloudinary', () => {
  it('lists every bundled image, so none is left on this server by mistake', async () => {
    const { readdirSync } = await import('node:fs')
    const { cloudImages } = await import('@/lib/cloud-images')
    const names = ['src/assets/images', 'src/assets/images/liv-prime', 'public/brand'].flatMap((dir) =>
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
