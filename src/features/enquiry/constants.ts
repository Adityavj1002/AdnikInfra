/**
 * Client-safe form constants and types. Deliberately free of Zod: the validation schemas
 * run on the server only, which keeps ~50 KB of validator out of every phone's download and
 * avoids Zod's eval feature-probe tripping the Content Security Policy.
 */

export const ENQUIRY_TOPICS = ['proposal', 'buy', 'site-visit', 'construction', 'sell', 'other'] as const
export type EnquiryTopic = (typeof ENQUIRY_TOPICS)[number]

export const topicLabels: Readonly<Record<EnquiryTopic, string>> = {
  proposal: 'Requesting a proposal',
  buy: 'Buying a home or plot',
  'site-visit': 'Booking a site visit',
  construction: 'Building on my plot',
  sell: 'Selling my property',
  other: 'Something else',
}

export const CONTACT_PREFERENCES = ['call', 'whatsapp', 'email'] as const
export type ContactPreference = (typeof CONTACT_PREFERENCES)[number]

export const preferenceLabels: Readonly<Record<ContactPreference, string>> = {
  call: 'Phone call',
  whatsapp: 'WhatsApp',
  email: 'Email',
}

export const VISIT_SLOTS = ['morning', 'afternoon', 'evening'] as const
export type VisitSlot = (typeof VISIT_SLOTS)[number]

export const visitSlotLabels: Readonly<Record<VisitSlot, string>> = {
  morning: 'Morning (10 am – 1 pm)',
  afternoon: 'Afternoon (1 – 4 pm)',
  evening: 'Evening (4 – 7 pm)',
}

/** Site visits can be requested up to this many days ahead. */
export const VISIT_WINDOW_DAYS = 60

const indiaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })

/**
 * Calendar date (YYYY-MM-DD) in India, `offsetDays` from today. Visits are booked in IST
 * whatever the server's or browser's clock says, so "today" flips at midnight in Jaipur.
 */
export function indiaDay(offsetDays = 0, now: Date = new Date()): string {
  const date = new Date(`${indiaDate.format(now)}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

export type FieldErrors = Partial<Record<string, string>>

export type FormState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'error'; errors: FieldErrors; values: Readonly<Record<string, string>> }>
  | Readonly<{ status: 'success'; reference: string; firstName: string; topic: EnquiryTopic }>
  | Readonly<{ status: 'unavailable' }>
  | Readonly<{ status: 'rate-limited' }>

export const initialFormState: FormState = { status: 'idle' }
