import type { FieldErrors } from './constants'

/**
 * Field rules shared by the server schema and the browser. Client-safe: plain patterns, no Zod
 * (see ./constants), so the form can flag a mistake as soon as the visitor leaves a field. The
 * server schema stays the only check that counts.
 */

// Letters and marks in any script (Devanagari, Gujarati…), spaces, apostrophes, dots, hyphens.
const PERSON_NAME = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u
// Indian mobile (optionally +91 / 91 / 0 prefixed) or any international E.164 number.
const INDIAN_PREFIX = /^(\+91|91|0)/
const INDIAN_MOBILE = /^[6-9]\d{9}$/
const REPEATED_DIGIT = /^(\d)\1{9}$/
const E164 = /^\+[1-9]\d{7,14}$/
const EMAIL_LOCAL = /^[A-Za-z0-9_'+-]+$/
const EMAIL_LABEL = /^[A-Za-z0-9][A-Za-z0-9-]*$/
const EMAIL_TLD = /^[A-Za-z]{2,}$/

export const MESSAGE_MIN = 10

export const errorMessages = {
  nameMissing: 'Please enter your name.',
  nameLong: 'Please keep your name under 100 characters.',
  nameLetters: 'Please use letters only.',
  phoneMissing: 'Please enter your phone number.',
  phoneInvalid: 'Please enter a valid mobile number, e.g. 98290 12345.',
  emailInvalid: 'Please enter a valid email address.',
  emailNeeded: 'Please add your email so we can write to you.',
  messageShort: `Please tell us a little more (at least ${MESSAGE_MIN} characters).`,
  messageLong: 'Please keep your message under 2,000 characters.',
  consent: 'Please agree so we can contact you.',
} as const

/** Spaces, dashes and brackets are formatting, not part of the number. */
export function compactPhone(value: string): string {
  return value.replace(/[\s()-]/g, '')
}

/** Expects a compacted number. A +91 number must be a real Indian mobile, not just any E.164. */
export function isPhone(value: string): boolean {
  if (value.startsWith('+') && !value.startsWith('+91')) return E164.test(value)
  const national = INDIAN_MOBILE.test(value) ? value : value.replace(INDIAN_PREFIX, '')
  return INDIAN_MOBILE.test(national) && !REPEATED_DIGIT.test(national)
}

export function isPersonName(value: string): boolean {
  return PERSON_NAME.test(value)
}

/**
 * The same rule as Zod's z.email() on the server, checked piece by piece rather than with one
 * nested pattern, so no input can make it backtrack.
 */
export function isEmail(value: string): boolean {
  if (value.length > 254) return false
  const at = value.indexOf('@')
  if (at < 1 || at !== value.lastIndexOf('@')) return false
  const local = value.slice(0, at).split('.')
  const domain = value.slice(at + 1).split('.')
  const tld = domain.pop() ?? ''
  return (
    local.every((part) => EMAIL_LOCAL.test(part)) &&
    !value.slice(0, at).endsWith("'") &&
    domain.length > 0 &&
    domain.every((label) => EMAIL_LABEL.test(label)) &&
    EMAIL_TLD.test(tld)
  )
}

/** A proposal, "Something else" and "Selling my property" can't be answered without a few words. */
export function needsMessage(topic: string | undefined): boolean {
  return topic === 'proposal' || topic === 'other' || topic === 'sell'
}

/** Fields the browser checks; topic, dates and slots come from fixed controls. */
export const CHECKED_FIELDS = ['name', 'phone', 'email', 'message', 'consent'] as const

/**
 * Browser-side check of the enquiry form, mirroring the server schema. Fields the form doesn't
 * render (the compact card has no email or message) arrive as undefined and are skipped.
 */
export function validateEnquiry(values: Readonly<Partial<Record<string, string>>>): FieldErrors {
  const errors: FieldErrors = {}
  const name = values.name?.trim() ?? ''
  if (name.length < 2) errors.name = errorMessages.nameMissing
  else if (name.length > 100) errors.name = errorMessages.nameLong
  else if (!isPersonName(name)) errors.name = errorMessages.nameLetters

  const phone = compactPhone(values.phone?.trim() ?? '')
  if (phone === '') errors.phone = errorMessages.phoneMissing
  else if (!isPhone(phone)) errors.phone = errorMessages.phoneInvalid

  if (values.email !== undefined) {
    const email = values.email.trim()
    if (email !== '' && !isEmail(email)) errors.email = errorMessages.emailInvalid
    else if (email === '' && values.preference === 'email') errors.email = errorMessages.emailNeeded
  }

  if (values.message !== undefined) {
    const message = values.message.trim()
    if (message.length > 2000) errors.message = errorMessages.messageLong
    else if (needsMessage(values.topic) && message.length < MESSAGE_MIN) errors.message = errorMessages.messageShort
  }

  if (values.consent !== 'on') errors.consent = errorMessages.consent
  return errors
}
