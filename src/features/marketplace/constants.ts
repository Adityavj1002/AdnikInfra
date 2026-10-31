/**
 * Client-safe marketplace constants and types (no Zod, no secrets): the sell form, the
 * public pages and the admin screens all read the same labels.
 */

export const LISTING_KINDS = ['plot', 'house', 'villa', 'apartment', 'commercial', 'agricultural', 'building'] as const
export type ListingKind = (typeof LISTING_KINDS)[number]

export const listingKindLabels: Readonly<Record<ListingKind, string>> = {
  plot: 'Plot',
  house: 'Independent house',
  villa: 'Villa',
  apartment: 'Flat / apartment',
  commercial: 'Shop / office / showroom',
  agricultural: 'Agricultural land',
  building: 'Whole building',
}

/** Kinds where bedrooms make sense. */
export const KINDS_WITH_BEDROOMS: readonly ListingKind[] = ['house', 'villa', 'apartment']

export const LISTING_PURPOSES = ['sale', 'rent'] as const
export type ListingPurpose = (typeof LISTING_PURPOSES)[number]
export const listingPurposeLabels: Readonly<Record<ListingPurpose, string>> = { sale: 'For sale', rent: 'For rent' }

export const AREA_UNITS = ['sqft', 'sqyd', 'sqm', 'acre', 'bigha', 'hectare'] as const
export type AreaUnit = (typeof AREA_UNITS)[number]
export const areaUnitLabels: Readonly<Record<AreaUnit, string>> = {
  sqft: 'sq ft',
  sqyd: 'sq yd (gaj)',
  sqm: 'sq m',
  acre: 'acre',
  bigha: 'bigha',
  hectare: 'hectare',
}

export const SELLER_ROLES = ['owner', 'agent', 'builder'] as const
export type SellerRole = (typeof SELLER_ROLES)[number]
export const sellerRoleLabels: Readonly<Record<SellerRole, string>> = {
  owner: 'Owner',
  agent: 'Agent / broker',
  builder: 'Builder / developer',
}

export const LISTING_STATUSES = ['unconfirmed', 'pending', 'approved', 'rejected'] as const
export type ListingStatus = (typeof LISTING_STATUSES)[number]
export const listingStatusLabels: Readonly<Record<ListingStatus, string>> = {
  unconfirmed: 'Email not confirmed',
  pending: 'Waiting for review',
  approved: 'Live',
  rejected: 'Rejected',
}

export const PHOTOS_MIN = 1
export const PHOTOS_MAX = 10
/** Before upload; Cloudinary also downsizes anything larger than 2400px on its side. */
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const

export const TITLE_MIN = 10
export const TITLE_MAX = 120
export const DESCRIPTION_MIN = 30
export const DESCRIPTION_MAX = 4000

/** A photo as stored: the provider id, never a URL the browser handed us. */
export type ListingPhoto = Readonly<{ id: string; width: number; height: number }>

export type ListingFormState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'error'; errors: Partial<Record<string, string>>; values: Readonly<Record<string, string>> }>
  | Readonly<{ status: 'success'; reference: string; email: string }>
  | Readonly<{ status: 'unavailable' }>
  | Readonly<{ status: 'rate-limited' }>

export const initialListingFormState: ListingFormState = { status: 'idle' }

/** What the browser gets back from the upload signer. */
export type UploadTicket =
  | Readonly<{
      ok: true
      provider: 'cloudinary'
      url: string
      fields: Readonly<Record<string, string>>
    }>
  | Readonly<{ ok: true; provider: 'dev'; url: string; fields: Readonly<Record<string, string>> }>
  | Readonly<{ ok: false; reason: 'unavailable' | 'rate-limited' }>
