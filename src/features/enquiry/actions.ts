'use server'

import { headers } from 'next/headers'
import { normalizeLine, normalizeMultiline, pickFields } from '@/security/normalize'
import { clientKey, createRateLimiter } from '@/security/rate-limit'
import type { FormState } from './constants'
import { deliverLead, newReference } from './lead-sink'
import { ENQUIRY_FIELDS, enquirySchema, toFieldErrors } from './schema'

// Coarse abuse limits per client, plus a global ceiling (forwarding headers are spoofable).
const perClient = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })
const globalLimit = createRateLimiter({ limit: 300, windowMs: 10 * 60_000 })

async function isRateLimited(): Promise<boolean> {
  const key = clientKey(await headers())
  return !perClient(key).allowed || !globalLimit('all').allowed
}

function echo(values: Record<string, unknown>): Record<string, string> {
  // Values are echoed back only to re-fill the form; React renders them as text.
  return Object.fromEntries(
    Object.entries(values)
      .filter(([key, value]) => typeof value === 'string' && key !== 'website')
      .map(([key, value]) => [key, String(value).slice(0, 2000)]),
  )
}

/** One server action for every enquiry form on the site (§11.2 pipeline). */
export async function submitEnquiry(_previous: FormState, form: FormData): Promise<FormState> {
  if (await isRateLimited()) return { status: 'rate-limited' }

  const raw = pickFields(form, ENQUIRY_FIELDS)
  const reference = newReference()

  // Honeypot: real people never see or fill this field. Bots get a convincing success.
  if (normalizeLine(raw.website) !== '') return { status: 'success', reference, firstName: 'there', topic: 'other' }

  const values = {
    topic: normalizeLine(raw.topic),
    ref: normalizeLine(raw.ref),
    name: normalizeLine(raw.name),
    phone: normalizeLine(raw.phone),
    email: normalizeLine(raw.email).toLowerCase(),
    preference: normalizeLine(raw.preference) || undefined,
    visitDate: normalizeLine(raw.visitDate),
    visitSlot: normalizeLine(raw.visitSlot),
    message: normalizeMultiline(raw.message),
    consent: normalizeLine(raw.consent),
  }

  const parsed = enquirySchema.safeParse(values)
  if (!parsed.success) {
    return { status: 'error', errors: toFieldErrors(parsed.error), values: echo(values) }
  }

  const { data } = parsed
  const delivered = await deliverLead(
    {
      kind: data.topic === 'site-visit' ? 'site-visit' : 'enquiry',
      topic: data.topic,
      ref: data.ref,
      name: data.name,
      phone: data.phone,
      email: data.email,
      preference: data.preference,
      message: data.message,
      visitDate: data.visitDate,
      visitSlot: data.visitSlot,
    },
    reference,
  )
  if (!delivered) return { status: 'unavailable' }
  return { status: 'success', reference, firstName: data.name.split(' ')[0] ?? data.name, topic: data.topic }
}
