import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import type { AmenityKey, Film, GeoPoint, Img, Project, UnitArea } from '@/content/types'
import { cloudBase, photoBase, isPhotoId } from '@/features/marketplace/media'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import { CACHE_SECONDS, cacheTags } from '@/lib/cache-tags'
import { isSlug } from '@/lib/slug'

/**
 * Projects live only in the database: one JSON record per project, created and edited in
 * Admin → Projects. Nothing about a project is written in the code. A record that doesn't
 * validate is skipped (and logged) rather than breaking the site.
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

const BLUR = 'data:image/gif;base64,R0lGODlhAQABAIAAAOrj1QAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
export const PHOTOS_LIMIT = 30
export const PLANS_LIMIT = 12

/** Media already in the site's own Cloudinary folders (the first projects' brochure files). */
const LIBRARY_PART = /^[a-z0-9-]{1,80}$/
const LIBRARY_FOLDERS = new Set(['projects', 'site', 'media'])
function isLibraryId(id: string): boolean {
  const [root, folder, ...rest] = id.split('/')
  return root === 'adnik' && LIBRARY_FOLDERS.has(folder ?? '') && rest.length >= 1 && rest.length <= 2 && rest.every((part) => LIBRARY_PART.test(part))
}
/** Videos: uploaded from Admin → Projects, or the first project's film. */
export const VIDEO_ID = /^adnik\/(?:videos\/[A-Za-z0-9_-]{6,100}|media\/[a-z0-9-]{1,80})$/

const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, min > 1 ? `${label}: please write at least ${min} characters.` : `${label}: please fill this in.`)
    .max(max, `${label}: please keep it under ${max} characters.`)
const amount = z.number().positive().max(1_000_000)

const photoSchema = z.object({
  ref: z.string().regex(/^(cloud|upload):[\w./-]{1,200}$/),
  alt: text(3, 200, 'Photo description'),
  width: z.number().int().min(1).max(20_000),
  height: z.number().int().min(1).max(20_000),
})

const filmSchema = z.object({
  video: z.string().regex(VIDEO_ID, 'Video: please upload it again.'),
  /** A still from the brochure; without one, a frame of the video is used. */
  poster: z.string().refine(isLibraryId).optional(),
  portrait: z.boolean(),
  title: text(3, 120, 'Video title'),
  description: text(10, 300, 'Video description'),
  seconds: z.number().int().min(1).max(3600),
  uploadDate: z.iso.date(),
  transcript: z.array(text(1, 400, 'What the video shows')).max(20),
})

export const recordSchema = z.object({
  name: text(2, 80, 'Name'),
  tagline: text(3, 120, 'Tagline'),
  summary: text(50, 160, 'Summary'),
  type: z.enum(['villa', 'apartment', 'plot', 'commercial']),
  status: z.enum(['ongoing', 'upcoming', 'completed']),
  localitySlug: z.string().refine(isSlug, 'Area: please choose one.'),
  stage: z.string().trim().max(40, 'Stage: please keep it under 40 characters.').optional(),
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
  nearby: z.array(z.object({ place: text(1, 80, 'Nearby place'), km: z.number().min(0).max(500).optional() })).max(40),
  units: z
    .array(z.object({ unit: text(1, 30, 'Unit'), bhk: z.number().int().min(1).max(10), carpet: amount.optional(), builtUp: amount, superBuiltUp: amount }))
    .max(80),
  photos: z.array(photoSchema).min(1, 'Photos: please add at least one photo.').max(PHOTOS_LIMIT),
  plans: z.array(photoSchema).max(PLANS_LIMIT).default([]),
  updates: z.array(z.object({ date: z.iso.date('Progress: dates are written 2026-11-04.'), text: text(3, 300, 'Progress update') })).max(30).default([]),
  film: filmSchema.optional(),
  // Set by the server when the project is created; lists projects oldest first.
  createdAt: z.string().max(40).optional(),
})

export type ProjectRecord = z.infer<typeof recordSchema>
export type PhotoRef = ProjectRecord['photos'][number]
export type FilmRecord = z.infer<typeof filmSchema>

/** An empty form for a new project (not valid until the admin fills it in). */
export function emptyRecord(localitySlug: string): ProjectRecord {
  return {
    name: '',
    tagline: '',
    summary: '',
    type: 'apartment',
    status: 'ongoing',
    localitySlug,
    stage: '',
    possession: '',
    address: '',
    description: [],
    configurations: [],
    facts: [],
    amenities: [],
    specifications: [],
    nearby: [],
    units: [],
    photos: [],
    plans: [],
    updates: [],
  }
}

/** A photo reference as an image next/image can render: the site's library, or an admin upload. */
export function resolvePhoto(photo: PhotoRef): Img | undefined {
  const at = photo.ref.indexOf(':')
  const [kind, id] = [photo.ref.slice(0, at), photo.ref.slice(at + 1)]
  const size = { width: photo.width, height: photo.height, blurDataURL: BLUR }
  if (kind === 'cloud') {
    const base = cloudBase('image')
    return base && isLibraryId(id) ? { src: { src: `${base}/${id}`, ...size }, alt: photo.alt } : undefined
  }
  if (!isPhotoId(id)) return undefined
  return { src: { src: `${photoBase()}/${id}`, ...size }, alt: photo.alt }
}

/** Photo refs the browser may send: library ids, or upload ids this site issued. */
export function isKnownPhotoRef(ref: string): boolean {
  const id = ref.slice(ref.indexOf(':') + 1)
  return ref.startsWith('cloud:') ? isLibraryId(id) : ref.startsWith('upload:') && isPhotoId(id)
}

/** The film's player sources, streamed from Cloudinary. Undefined when no cloud is configured. */
export function resolveFilm(film: FilmRecord): Film | undefined {
  const [image, video] = [cloudBase('image'), cloudBase('video')]
  if (!image || !video) return undefined
  return {
    title: film.title,
    description: film.description,
    poster: film.poster ? `${image}/f_auto,q_auto,w_720/${film.poster}` : `${video}/so_1,f_jpg,q_auto,w_720/${film.video}.jpg`,
    sources: [{ src: `${video}/q_auto/${film.video}.mp4`, type: 'video/mp4' }],
    duration: `PT${film.seconds}S`,
    uploadDate: film.uploadDate,
    transcript: film.transcript,
    portrait: film.portrait,
  }
}

const sqft = (value: number) => ({ value, unit: 'sqft' as const })

/** A record as the project the pages render. */
export function toProject(slug: string, record: ProjectRecord, updatedAt: string, geo: GeoPoint): Project {
  const resolve = (photos: readonly PhotoRef[]) => photos.flatMap((photo) => resolvePhoto(photo) ?? [])
  const film = record.film && resolveFilm(record.film)
  return {
    slug,
    name: record.name,
    type: record.type,
    status: record.status,
    ...(record.stage ? { stage: record.stage } : {}),
    localitySlug: record.localitySlug,
    tagline: record.tagline,
    summary: record.summary,
    description: record.description,
    ...(record.address ? { address: record.address } : {}),
    configurations: record.configurations.map((c) => ({ label: c.label, area: c.to && c.to !== c.from ? ([sqft(c.from), sqft(c.to)] as const) : sqft(c.from) })),
    units: record.units as readonly UnitArea[],
    plans: resolve(record.plans),
    ...(film ? { film } : {}),
    possession: record.possession,
    rera: null,
    facts: record.facts,
    amenities: record.amenities,
    specifications: record.specifications,
    nearby: record.nearby,
    geo,
    gallery: resolve(record.photos),
    updates: [...record.updates].sort((a, b) => b.date.localeCompare(a.date)),
    updatedAt: updatedAt.slice(0, 10),
  }
}

const projectRows = unstable_cache(async () => (await getStore()).listProjectRecords(), ['project-records'], {
  tags: [cacheTags.projects],
  revalidate: CACHE_SECONDS,
})

export type SavedProject = Readonly<{ slug: string; record: ProjectRecord; updatedAt: string }>

/** Every valid project record, oldest first, read once per request. A failure means "no projects". */
export const savedProjects = cache(async (): Promise<readonly SavedProject[]> => {
  if (!marketplaceEnabled) return []
  try {
    const rows = await projectRows()
    const valid: SavedProject[] = []
    for (const row of rows) {
      const parsed = recordSchema.safeParse(row.data)
      if (parsed.success && isSlug(row.slug)) valid.push({ slug: row.slug, record: parsed.data, updatedAt: row.updatedAt })
      else console.error(`[projects] ignoring an invalid saved record ${JSON.stringify({ slug: row.slug })}`)
    }
    const created = (p: SavedProject) => p.record.createdAt ?? p.updatedAt
    return valid.sort((a, b) => created(a).localeCompare(created(b)) || a.slug.localeCompare(b.slug))
  } catch (error) {
    console.error(`[projects] read failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return []
  }
})

export async function savedProject(slug: string): Promise<SavedProject | undefined> {
  return (await savedProjects()).find((p) => p.slug === slug)
}
