import 'server-only'
import { z } from 'zod'
import { isSlug } from '@/lib/slug'
import { CONTACT_PREFERENCES, ENQUIRY_TOPICS, VISIT_SLOTS, VISIT_WINDOW_DAYS, indiaDay, type FieldErrors } from './constants'
import { MESSAGE_MIN, compactPhone, errorMessages, isPersonName, isPhone, needsMessage } from './validation'

export { compactPhone }

/** Server-side validation: the only check that counts. Client code imports ./constants instead. */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), schema.optional())

export const nameField = z
  .string()
  .min(2, errorMessages.nameMissing)
  .max(100, errorMessages.nameLong)
  .refine(isPersonName, errorMessages.nameLetters)

export const phoneField = z
  .string()
  .min(1, errorMessages.phoneMissing)
  .transform(compactPhone)
  .refine(isPhone, errorMessages.phoneInvalid)

export const emailField = z.email(errorMessages.emailInvalid).max(254)

export const consentField = z.literal('on', { error: errorMessages.consent })

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
    message: z.string().max(2000, errorMessages.messageLong).default(''),
    consent: consentField,
  })
  .superRefine((enquiry, ctx) => {
    if (enquiry.preference === 'email' && !enquiry.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: errorMessages.emailNeeded })
    }
    if (needsMessage(enquiry.topic) && enquiry.message.length < MESSAGE_MIN) {
      ctx.addIssue({ code: 'custom', path: ['message'], message: errorMessages.messageShort })
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
