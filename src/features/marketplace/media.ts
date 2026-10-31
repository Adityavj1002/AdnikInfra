import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { env } from '@/security/env'
import { PHOTOS_MAX, type ListingPhoto, type UploadTicket } from './constants'

/**
 * Listing photos. In production the seller's browser uploads straight to Cloudinary with a
 * short-lived signature from us, so large files never pass through this server. We store only
 * the Cloudinary public id and build every URL ourselves. Memory mode (development, e2e) keeps
 * uploads in process memory behind /api/marketplace/dev-*.
 */

const FOLDER = 'adnik/marketplace'
const CLOUDINARY_ID = /^adnik\/marketplace\/[A-Za-z0-9_-]{6,100}$/
const DEV_ID = /^dev\/[A-Za-z0-9_-]{20,64}$/

export const useCloudinary = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)
export const devUploadsEnabled = env.MARKETPLACE_MODE === 'memory' && !useCloudinary

/** Cloudinary signature: sorted `key=value` pairs joined by `&`, then the secret, SHA-1. */
export function cloudinarySignature(params: Readonly<Record<string, string>>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(payload + secret).digest('hex')
}

export function createUploadTicket(now: Date = new Date()): UploadTicket {
  if (useCloudinary && env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    const params = {
      folder: FOLDER,
      timestamp: String(Math.floor(now.getTime() / 1000)),
      allowed_formats: 'jpg,jpeg,png,webp,heic,heif',
      // Downsize on arrival: phones shoot 4000px+, nobody needs more than 2400px here.
      transformation: 'c_limit,w_2400,h_2400',
    }
    return {
      ok: true,
      provider: 'cloudinary',
      url: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      fields: { ...params, api_key: env.CLOUDINARY_API_KEY, signature: cloudinarySignature(params, env.CLOUDINARY_API_SECRET) },
    }
  }
  if (devUploadsEnabled) return { ok: true, provider: 'dev', url: '/api/marketplace/dev-upload', fields: {} }
  return { ok: false, reason: 'unavailable' }
}

export function isPhotoId(id: string): boolean {
  return useCloudinary ? CLOUDINARY_ID.test(id) : devUploadsEnabled && DEV_ID.test(id)
}

/** Where the browser loads photos from; widths are appended by the image loader. */
export function photoBase(): string {
  return useCloudinary ? `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload` : '/api/marketplace/dev-media'
}

/** An absolute URL for emails and structured data. */
export function photoUrl(id: string, width: number, siteUrl: string): string {
  return useCloudinary
    ? `${photoBase()}/f_auto,q_auto,c_limit,w_${width}/${id}`
    : new URL(`${photoBase()}/${id}?w=${width}`, siteUrl).href
}

// ── Development uploads (memory mode only) ─────────────────────────────────────

type DevPhoto = Readonly<{ bytes: Uint8Array; type: string }>
const devHolder = globalThis as typeof globalThis & { __adnikDevPhotos?: Map<string, DevPhoto> }
const devPhotos = () => (devHolder.__adnikDevPhotos ??= new Map())

export function saveDevPhoto(bytes: Uint8Array, type: string): string {
  const id = `dev/${randomBytes(18).toString('base64url')}`
  const photos = devPhotos()
  photos.set(id, { bytes, type })
  // Bounded: the oldest uploads go first.
  if (photos.size > 200) photos.delete(photos.keys().next().value ?? '')
  return id
}

export function readDevPhoto(id: string): DevPhoto | undefined {
  return devPhotos().get(id)
}

// ── Checking what the browser sent ─────────────────────────────────────────────

/** Parses the photos field: ids we issued, real dimensions, no duplicates. Never trusts a URL. */
export function parsePhotos(raw: string): readonly ListingPhoto[] | undefined {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return undefined
  }
  if (!Array.isArray(value) || value.length > PHOTOS_MAX) return undefined
  const photos: ListingPhoto[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return undefined
    const { id, width, height } = item as Record<string, unknown>
    if (typeof id !== 'string' || !isPhotoId(id)) return undefined
    if (!Number.isInteger(width) || !Number.isInteger(height)) return undefined
    if ((width as number) < 1 || (height as number) < 1 || (width as number) > 20_000 || (height as number) > 20_000) return undefined
    if (photos.some((p) => p.id === id)) return undefined
    photos.push({ id, width: width as number, height: height as number })
  }
  return photos
}

/** Confirms each photo really exists where we'd serve it from, so a forged id can't slip in. */
export async function photosExist(photos: readonly ListingPhoto[]): Promise<boolean> {
  if (!useCloudinary) return photos.every((photo) => devPhotos().has(photo.id))
  const checks = await Promise.all(
    photos.map(async (photo) => {
      try {
        const response = await fetch(`${photoBase()}/${photo.id}`, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
        return response.ok
      } catch {
        return false
      }
    }),
  )
  return checks.every(Boolean)
}
