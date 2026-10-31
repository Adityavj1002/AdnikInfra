import 'server-only'
import { z } from 'zod'
import { consentField, emailField, nameField, phoneField } from '@/features/enquiry/schema'
import {
  AREA_UNITS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  KINDS_WITH_BEDROOMS,
  LISTING_KINDS,
  LISTING_PURPOSES,
  SELLER_ROLES,
  TITLE_MAX,
  TITLE_MIN,
} from './constants'

/** Server-side validation of the sell form: the only check that counts. */

// Places are names: letters in any script, digits (sector numbers), spaces and light punctuation.
const PLACE = /^[\p{L}\p{M}\d][\p{L}\p{M}\d\s.,'’()/-]*$/u
// No markup in titles; descriptions may hold anything and are always rendered as text.
const NO_MARKUP = /^[^<>{}]*$/

/** "45,00,000", "45 00 000" and "4500000" are all forty-five lakh. */
const digitsOnly = (value: unknown) => (typeof value === 'string' ? value.replace(/[\s,₹]/g, '') : value)

const place = (label: string) =>
  z
    .string()
    .min(2, `Please enter the ${label}.`)
    .max(80, `Please keep the ${label} under 80 characters.`)
    .regex(PLACE, `Please use letters and numbers only in the ${label}.`)

export const listingSchema = z
  .object({
    kind: z.enum(LISTING_KINDS, { error: 'Please choose the property type.' }),
    purpose: z.enum(LISTING_PURPOSES, { error: 'Please choose sale or rent.' }).default('sale'),
    title: z
      .string()
      .min(TITLE_MIN, `Please write a title of at least ${TITLE_MIN} characters.`)
      .max(TITLE_MAX, `Please keep the title under ${TITLE_MAX} characters.`)
      .regex(NO_MARKUP, 'Please remove < > { } from the title.'),
    description: z
      .string()
      .min(DESCRIPTION_MIN, `Please describe the property in at least ${DESCRIPTION_MIN} characters.`)
      .max(DESCRIPTION_MAX, `Please keep the description under ${DESCRIPTION_MAX.toLocaleString('en-IN')} characters.`),
    price: z.preprocess(
      digitsOnly,
      z
        .string()
        .min(1, 'Please enter the price in rupees.')
        .regex(/^\d{1,12}$/, 'Please enter the price in rupees, digits only.')
        .transform(Number)
        .refine((value) => value >= 1_000, 'Please enter the full price in rupees, e.g. 4500000 for ₹45 lakh.'),
    ),
    areaValue: z.preprocess(
      digitsOnly,
      z
        .string()
        .min(1, 'Please enter the area.')
        .regex(/^\d{1,9}$|^\d{1,9}\.\d{1,2}$/, 'Please enter the area as a number, e.g. 1200 or 2.5.')
        .transform(Number)
        .refine((value) => value > 0, 'Please enter the area.'),
    ),
    areaUnit: z.enum(AREA_UNITS, { error: 'Please choose the area unit.' }),
    bedrooms: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      z.coerce.number({ error: 'Please choose the number of bedrooms.' }).int().min(0).max(20).optional(),
    ),
    city: place('city'),
    locality: place('locality or area'),
    sellerName: nameField,
    sellerPhone: phoneField,
    sellerEmail: emailField.min(1, 'Please enter your email: we send a confirmation link to it.'),
    sellerRole: z.enum(SELLER_ROLES).default('owner'),
    consent: consentField,
  })
  .transform((listing) => ({
    ...listing,
    bedrooms: KINDS_WITH_BEDROOMS.includes(listing.kind) ? (listing.bedrooms ?? null) : null,
  }))

export type ListingInput = z.infer<typeof listingSchema>

export const LISTING_FIELDS = [
  'kind',
  'purpose',
  'title',
  'description',
  'price',
  'areaValue',
  'areaUnit',
  'bedrooms',
  'city',
  'locality',
  'sellerName',
  'sellerPhone',
  'sellerEmail',
  'sellerRole',
  'photos',
  'consent',
  'website',
] as const

/** URL slug: the title in lower-case words, then the reference so it is always unique. */
export function listingSlug(title: string, reference: string): string {
  const words = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return `${words || 'property'}-${reference.toLowerCase()}`
}
