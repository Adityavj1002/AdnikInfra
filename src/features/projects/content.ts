import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import { livPrime, villasSkit } from '@/content/images'
import type { AmenityKey, Film, Img, Project, UnitArea } from '@/content/types'
import { photoBase, isPhotoId, useCloudinary } from '@/features/marketplace/media'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import { CACHE_SECONDS, cacheTags } from '@/lib/cache-tags'

/**
 * Admin-editable project content. The bundled project (content/fixtures) is the default; what an
 * admin saves in Admin → Projects is stored as one JSON record per project and replaces those
 * fields. A missing, unreadable or invalid record falls back to the bundled content.
 */

export const AMENITY_KEYS = [
  'clubhouse',
  'pool',
  'gym',
  'garden',
  'kids-play',
  'security',
  'cctv',
  'power-backup',
  'parking',
  'jogging-track',
  'rainwater',
  'solar',
  'ev-charging',
  'lift',
  'gated',
  'community-hall',
  'wifi',
  'library',
  'theatre',
  'indoor-games',
  'banquet',
  'guest-room',
  'water-supply',
  'vastu',
  'accessible',
] as const satisfies readonly AmenityKey[]

/** Photos bundled with the site, by key; anything else is an uploaded photo id. */
const library: Readonly<Record<string, Img>> = {
  ...livPrime,
  villaFront: villasSkit.front,
  villaSite: villasSkit.site,
  villaPlans: villasSkit.plans,
}

/**
 * The same brochure files on Cloudinary (uploaded once under these ids). With Cloudinary
 * configured they are served from there; the bundled copies stay as the fallback and supply
 * the size and blur placeholder.
 */
const cloudIds: Readonly<Record<string, string>> = {
  exteriorFront: 'adnik/projects/liv-prime/exterior-front',
  exteriorStreet: 'adnik/projects/liv-prime/exterior-street',
  aerial: 'adnik/projects/liv-prime/aerial',
  indoorPool: 'adnik/projects/liv-prime/indoor-pool',
  gym: 'adnik/projects/liv-prime/gym',
  library: 'adnik/projects/liv-prime/library',
  theatre: 'adnik/projects/liv-prime/private-theatre',
  gamesRoom: 'adnik/projects/liv-prime/games-room',
  kidsPlayroom: 'adnik/projects/liv-prime/kids-playroom',
  banquetHall: 'adnik/projects/liv-prime/banquet-hall',
  plan2bhk: 'adnik/projects/liv-prime/plan-2bhk-3d',
  plan3bhk: 'adnik/projects/liv-prime/plan-3bhk-3d',
  villaFront: 'adnik/projects/villas-skit/villa-front',
  villaSite: 'adnik/projects/villas-skit/site-november-2026',
  villaPlans: 'adnik/projects/villas-skit/floor-plans',
}

function hostedAs(key: string, img: Img): Img {
  const id = useCloudinary ? cloudIds[key] : undefined
  return id ? { alt: img.alt, src: { ...img.src, src: `${photoBase()}/${id}` } } : img
}

/** A film from public/media, streamed from Cloudinary when it is configured (same file, uploaded once). */
export function hostedFilm(film: Film): Film {
  if (!useCloudinary) return film
  const cloud = photoBase().replace('/image/upload', '')
  const name = (path: string) => path.slice('/media/'.length).replace(/\.[^.]+$/, '')
  const local = (path: string) => path.startsWith('/media/')
  return {
    ...film,
    poster: local(film.poster) ? `${cloud}/image/upload/f_auto,q_auto,w_720/adnik/media/${name(film.poster)}` : film.poster,
    sources: film.sources.map((source) => (local(source.src) ? { ...source, src: `${cloud}/video/upload/q_auto/adnik/media/${name(source.src)}.mp4` } : source)),
  }
}

/** A bundled photo, served from Cloudinary when it is configured. Other images pass through. */
export function hosted(img: Img): Img {
  const key = Object.entries(library).find(([, value]) => value === img)?.[0]
  return key ? hostedAs(key, img) : img
}
const BLUR = 'data:image/gif;base64,R0lGODlhAQABAIAAAOrj1QAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
export const PHOTOS_LIMIT = 30

const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, min > 1 ? `${label}: please write at least ${min} characters.` : `${label}: please fill this in.`)
    .max(max, `${label}: please keep it under ${max} characters.`)
const amount = z.number().positive().max(1_000_000)

const photoSchema = z.object({
  ref: z.string().regex(/^(static|upload):[\w./-]{1,200}$/),
  alt: text(3, 200, 'Photo description'),
  width: z.number().int().min(1).max(20_000),
  height: z.number().int().min(1).max(20_000),
})

export const recordSchema = z.object({
  name: text(2, 80, 'Name'),
  tagline: text(3, 120, 'Tagline'),
  summary: text(50, 160, 'Summary'),
  type: z.enum(['villa', 'apartment', 'plot', 'commercial']),
  status: z.enum(['ongoing', 'upcoming', 'completed']),
  possession: text(1, 60, 'Possession'),
  address: z.string().trim().max(200, 'Address: please keep it under 200 characters.'),
  description: z.array(text(20, 1500, 'Description paragraph')).min(1, 'Description: please write at least one paragraph.').max(8),
  configurations: z
    .array(z.object({ label: text(1, 40, 'Home type'), from: amount, to: amount.optional() }))
    .min(1, 'Homes: please add at least one type.')
    .max(10),
  facts: z.array(z.object({ label: text(1, 40, 'Fact'), value: text(1, 80, 'Fact') })).max(12),
  amenities: z.array(z.enum(AMENITY_KEYS)).max(AMENITY_KEYS.length),
  specifications: z.array(z.object({ group: text(1, 40, 'Specification heading'), items: z.array(text(1, 160, 'Specification')).min(1).max(12) })).max(12),
  nearby: z.array(z.object({ place: text(1, 80, 'Nearby place'), km: z.number().min(0).max(500) })).max(40),
  units: z
    .array(z.object({ unit: text(1, 30, 'Unit'), bhk: z.number().int().min(1).max(10), carpet: amount, builtUp: amount, superBuiltUp: amount }))
    .max(80),
  photos: z.array(photoSchema).min(1, 'Photos: please keep at least one photo.').max(PHOTOS_LIMIT),
})

export type ProjectRecord = z.infer<typeof recordSchema>
export type PhotoRef = ProjectRecord['photos'][number]

const keyOf = (img: Img) => Object.entries(library).find(([, value]) => value === img)?.[0]

/** The bundled project as a record: the admin form's starting point until a record is saved. */
export function toRecord(project: Project): ProjectRecord {
  return {
    name: project.name,
    tagline: project.tagline,
    summary: project.summary,
    type: project.type,
    status: project.status,
    possession: project.possession,
    address: project.address ?? '',
    description: [...project.description],
    configurations: project.configurations.map((c) =>
      Array.isArray(c.area) ? { label: c.label, from: c.area[0]!.value, to: c.area[1]!.value } : { label: c.label, from: (c.area as { value: number }).value },
    ),
    facts: project.facts.map((f) => ({ ...f })),
    amenities: project.amenities.filter((a): a is (typeof AMENITY_KEYS)[number] => (AMENITY_KEYS as readonly string[]).includes(a)),
    specifications: project.specifications.map((s) => ({ group: s.group, items: [...s.items] })),
    nearby: project.nearby.map((n) => ({ ...n })),
    units: (project.units ?? []).map((u) => ({ ...u })),
    photos: project.gallery.flatMap((img) => {
      const key = keyOf(img)
      // Sizes come from the build's image import; the fallback only matters outside Next (unit tests).
      return key ? [{ ref: `static:${key}`, alt: img.alt, width: img.src.width || 1600, height: img.src.height || 1000 }] : []
    }),
  }
}

/** A photo reference as an image next/image can render: bundled, or uploaded to the photo host. */
export function resolvePhoto(photo: PhotoRef): Img | undefined {
  const [kind, id] = [photo.ref.slice(0, photo.ref.indexOf(':')), photo.ref.slice(photo.ref.indexOf(':') + 1)]
  if (kind === 'static') {
    const img = library[id]
    return img && { ...hostedAs(id, img), alt: photo.alt }
  }
  if (!isPhotoId(id)) return undefined
  return { src: { src: `${photoBase()}/${id}`, width: photo.width, height: photo.height, blurDataURL: BLUR }, alt: photo.alt }
}

/** Photo refs the browser may send: bundled keys, or upload ids this site issued. */
export function isKnownPhotoRef(ref: string): boolean {
  const id = ref.slice(ref.indexOf(':') + 1)
  return ref.startsWith('static:') ? Object.hasOwn(library, id) : ref.startsWith('upload:') && isPhotoId(id)
}

const sqft = (value: number) => ({ value, unit: 'sqft' as const })

export function applyRecord(base: Project, record: ProjectRecord, updatedAt: string): Project {
  const gallery = record.photos.flatMap((photo) => resolvePhoto(photo) ?? [])
  return {
    ...base,
    name: record.name,
    tagline: record.tagline,
    summary: record.summary,
    type: record.type,
    status: record.status,
    possession: record.possession,
    address: record.address || undefined,
    description: record.description,
    configurations: record.configurations.map((c) => ({ label: c.label, area: c.to && c.to !== c.from ? ([sqft(c.from), sqft(c.to)] as const) : sqft(c.from) })),
    facts: record.facts,
    amenities: record.amenities,
    specifications: record.specifications,
    nearby: record.nearby,
    units: record.units as readonly UnitArea[],
    gallery: gallery.length > 0 ? gallery : base.gallery,
    updatedAt: updatedAt.slice(0, 10),
  }
}

const projectRows = unstable_cache(async () => (await getStore()).listProjectRecords(), ['project-records'], {
  tags: [cacheTags.projects],
  revalidate: CACHE_SECONDS,
})

/** Every saved record, read once per request. Any failure means "use the bundled content". */
export const savedProjects = cache(async (): Promise<Readonly<Record<string, Readonly<{ record: ProjectRecord; updatedAt: string }>>>> => {
  if (!marketplaceEnabled) return {}
  try {
    const rows = await projectRows()
    const valid: Record<string, Readonly<{ record: ProjectRecord; updatedAt: string }>> = {}
    for (const row of rows) {
      const parsed = recordSchema.safeParse(row.data)
      if (parsed.success) valid[row.slug] = { record: parsed.data, updatedAt: row.updatedAt }
      else console.error(`[projects] ignoring an invalid saved record ${JSON.stringify({ slug: row.slug })}`)
    }
    return valid
  } catch (error) {
    console.error(`[projects] read failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return {}
  }
})
