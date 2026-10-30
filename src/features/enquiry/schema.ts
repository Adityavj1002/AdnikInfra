import 'server-only'
import { z } from 'zod'
import { isSlug } from '@/lib/slug'
import { CONTACT_PREFERENCES, ENQUIRY_TOPICS, VISIT_SLOTS, VISIT_WINDOW_DAYS, indiaDay, type FieldErrors } from './constants'

/** Server-side validation: the only check that counts. Client code imports ./constants instead. */

// Letters and marks in any script (Devanagari, Gujarati…), spaces, apostrophes, dots, hyphens.
const PERSON_NAME = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u
// Indian mobile (optionally +91 / 91 / 0 prefixed) or any international E.164 number.
const INDIAN_PREFIX = /^(\+91|91|0)/
const INDIAN_MOBILE = /^[6-9]\d{9}$/
const E164 = /^\+[1-9]\d{7,14}$/

function isPhone(value: string): boolean {
  return INDIAN_MOBILE.test(value) || INDIAN_MOBILE.test(value.replace(INDIAN_PREFIX, '')) || E164.test(value)
}
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), schema.optional())

/** Spaces, dashes and brackets are formatting, not part of the number. */
export function compactPhone(value: string): string {
  return value.replace(/[\s()-]/g, '')
}

export const nameField = z
  .string()
  .min(2, 'Please enter your name.')
  .max(100, 'Please keep your name under 100 characters.')
  .regex(PERSON_NAME, 'Please use letters only.')

export const phoneField = z
  .string()
  .min(1, 'Please enter your phone number.')
  .transform(compactPhone)
  .refine(isPhone, 'Please enter a valid mobile number, e.g. 98290 12345.')

export const emailField = z.email('Please enter a valid email address.').max(254)

export const consentField = z.literal('on', { error: 'Please agree so we can contact you.' })

export function isFutureVisitDate(value: string, now: Date = new Date()): boolean {
  if (!ISO_DATE.test(value)) return false
  const date = Date.parse(`${value}T00:00:00Z`)
  // Reject impossible dates (e.g. 31 Feb) that some engines silently roll into the next month.
  if (Number.isNaN(date) || new Date(date).toISOString().slice(0, 10) !== value) return false
  // ISO dates compare correctly as strings.
  return value >= indiaDay(0, now) && value <= indiaDay(VISIT_WINDOW_DAYS, now)
}

export const enquirySchema = z
  .object({
    topic: z.enum(ENQUIRY_TOPICS, { error: 'Please choose what you’d like help with.' }),
    ref: optional(z.string().max(80).refine(isSlug)),
    name: nameField,
    phone: phoneField,
    email: optional(emailField),
    preference: z.enum(CONTACT_PREFERENCES).default('call'),
    visitDate: optional(z.string().refine(isFutureVisitDate, `Please pick a date in the next ${VISIT_WINDOW_DAYS} days.`)),
    visitSlot: optional(z.enum(VISIT_SLOTS)),
    message: z.string().max(2000, 'Please keep your message under 2,000 characters.').default(''),
    consent: consentField,
  })
  .superRefine((enquiry, ctx) => {
    if (enquiry.preference === 'email' && !enquiry.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Please add your email so we can write to you.' })
    }
    if ((enquiry.topic === 'other' || enquiry.topic === 'sell') && enquiry.message.length < 10) {
      ctx.addIssue({ code: 'custom', path: ['message'], message: 'Please tell us a little more (at least 10 characters).' })
    }
  })

export type Enquiry = z.infer<typeof enquirySchema>

export const ENQUIRY_FIELDS = [
  'topic',
  'ref',
  'name',
  'phone',
  'email',
  'preference',
  'visitDate',
  'visitSlot',
  'message',
  'consent',
  'website',
] as const

/** First message per field, in schema order, for the error summary and inline errors. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}
