'use server'

import { headers } from 'next/headers'
import { toFieldErrors } from '@/features/enquiry/schema'
import { newReference } from '@/features/enquiry/lead-sink'
import { sendEmail } from '@/features/email/mailer'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { normalizeLine, normalizeMultiline, pickFields } from '@/security/normalize'
import { clientKey, createRateLimiter } from '@/security/rate-limit'
import { hashToken, isTokenShape, randomToken } from '@/security/tokens'
import { PHOTOS_MIN, type ListingFormState, type UploadTicket } from './constants'
import { CONFIRM_HOURS, listingConfirmEmail } from './emails'
import { createUploadTicket, parsePhotos, photosExist } from './media'
import { notifyConfirmed } from './notify'
import { getStore, marketplaceEnabled } from './runtime'
import { LISTING_FIELDS, listingSchema, listingSlug } from './schema'

const ticketLimit = createRateLimiter({ limit: 60, windowMs: 10 * 60_000 })
const submitLimit = createRateLimiter({ limit: 5, windowMs: 60 * 60_000 })
const confirmLimit = createRateLimiter({ limit: 20, windowMs: 10 * 60_000 })
const globalLimit = createRateLimiter({ limit: 300, windowMs: 10 * 60_000 })

const limited = async (limiter: ReturnType<typeof createRateLimiter>) => {
  const key = clientKey(await headers())
  return !limiter(key).allowed || !globalLimit('all').allowed
}

/** A short-lived permission to upload one photo, straight from the browser. */
export async function requestUploadTicket(): Promise<UploadTicket> {
  if (!marketplaceEnabled) return { ok: false, reason: 'unavailable' }
  if (await limited(ticketLimit)) return { ok: false, reason: 'rate-limited' }
  return createUploadTicket()
}

/** The sell form: validate, store as unconfirmed, and email the seller a confirmation link. */
export async function submitListing(_previous: ListingFormState, form: FormData): Promise<ListingFormState> {
  if (!marketplaceEnabled) return { status: 'unavailable' }
  if (await limited(submitLimit)) return { status: 'rate-limited' }

  const raw = pickFields(form, LISTING_FIELDS)
  // Honeypot: bots get a convincing success and nothing is stored.
  if (normalizeLine(raw.website) !== '') return { status: 'success', reference: newReference('MKT'), email: '' }

  const values = {
    kind: normalizeLine(raw.kind),
    purpose: normalizeLine(raw.purpose) || undefined,
    title: normalizeLine(raw.title),
    description: normalizeMultiline(raw.description),
    price: normalizeLine(raw.price),
    areaValue: normalizeLine(raw.areaValue),
    areaUnit: normalizeLine(raw.areaUnit),
    bedrooms: normalizeLine(raw.bedrooms),
    city: normalizeLine(raw.city),
    locality: normalizeLine(raw.locality),
    sellerName: normalizeLine(raw.sellerName),
    sellerPhone: normalizeLine(raw.sellerPhone),
    sellerEmail: normalizeLine(raw.sellerEmail).toLowerCase(),
    sellerRole: normalizeLine(raw.sellerRole) || undefined,
    consent: normalizeLine(raw.consent),
  }
  const photosRaw = typeof raw.photos === 'string' ? raw.photos.slice(0, 5000) : '[]'
  const echo = () =>
    Object.fromEntries(
      Object.entries({ ...values, photos: photosRaw }).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    )

  const parsed = listingSchema.safeParse(values)
  const photos = parsePhotos(photosRaw)
  const errors = parsed.success ? {} : toFieldErrors(parsed.error)
  if (!photos) errors.photos = 'Please upload the photos again.'
  else if (photos.length < PHOTOS_MIN) errors.photos = 'Please add at least one photo of the property.'
  if (!parsed.success || !photos || Object.keys(errors).length > 0) return { status: 'error', errors, values: echo() }

  if (!(await photosExist(photos))) {
    return { status: 'error', errors: { photos: 'One of the photos did not upload properly. Please add it again.' }, values: echo() }
  }

  const { data } = parsed
  const reference = newReference('MKT')
  const token = randomToken()
  try {
    const store = await getStore()
    const listing = await store.createListing({
      reference,
      slug: listingSlug(data.title, reference),
      kind: data.kind,
      purpose: data.purpose,
      title: data.title,
      description: data.description,
      priceInr: data.price,
      areaValue: data.areaValue,
      areaUnit: data.areaUnit,
      bedrooms: data.bedrooms,
      city: data.city,
      locality: data.locality,
      images: photos,
      sellerName: data.sellerName,
      sellerPhone: data.sellerPhone,
      sellerEmail: data.sellerEmail,
      sellerRole: data.sellerRole,
      confirmTokenHash: hashToken(token),
      confirmExpiresAt: new Date(Date.now() + CONFIRM_HOURS * 3_600_000).toISOString(),
    })
    const confirmUrl = new URL(routes.marketplaceConfirm, env.SITE_URL)
    confirmUrl.searchParams.set('token', token)
    const sent = await sendEmail({
      to: { name: listing.sellerName, address: listing.sellerEmail },
      message: listingConfirmEmail(listing, confirmUrl.href),
      tag: `listing-confirm ${reference}`,
    })
    if (!sent) return { status: 'unavailable' }
    return { status: 'success', reference, email: listing.sellerEmail }
  } catch (error) {
    console.error(`[marketplace] submit failed ${JSON.stringify({ reference, error: String(error).slice(0, 120) })}`)
    return { status: 'unavailable' }
  }
}

export type ConfirmState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'confirmed'; reference: string }>
  | Readonly<{ status: 'expired' }>
  | Readonly<{ status: 'invalid' }>
  | Readonly<{ status: 'unavailable' }>

/** A button on the confirm page, not the email link itself: mail scanners follow links. */
export async function confirmListing(_previous: ConfirmState, form: FormData): Promise<ConfirmState> {
  if (!marketplaceEnabled) return { status: 'unavailable' }
  if (await limited(confirmLimit)) return { status: 'unavailable' }
  const token = form.get('token')
  if (!isTokenShape(token)) return { status: 'invalid' }
  try {
    const store = await getStore()
    const result = await store.confirmListing(hashToken(token), new Date())
    if (result === 'expired') return { status: 'expired' }
    if (!result) return { status: 'invalid' }
    await notifyConfirmed(store, result)
    return { status: 'confirmed', reference: result.reference }
  } catch (error) {
    console.error(`[marketplace] confirm failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return { status: 'unavailable' }
  }
}
