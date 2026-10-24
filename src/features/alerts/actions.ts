'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { deliverAlertSignup, newReference } from '@/features/enquiry/lead-sink'
import { normalizeLine, pickFields } from '@/security/normalize'
import { clientKey, createRateLimiter } from '@/security/rate-limit'
import type { AlertsState } from './constants'

const perClient = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 })
const globalLimit = createRateLimiter({ limit: 200, windowMs: 10 * 60_000 })
const emailSchema = z.email().max(254)
const FIELDS = ['email', 'website'] as const

/** "New listings by email": the same pipeline as enquiries, with only an email address. */
export async function subscribeAlerts(_previous: AlertsState, form: FormData): Promise<AlertsState> {
  const key = clientKey(await headers())
  if (!perClient(key).allowed || !globalLimit('all').allowed) return { status: 'rate-limited' }

  const raw = pickFields(form, FIELDS)
  // Honeypot: bots get a convincing success.
  if (normalizeLine(raw.website) !== '') return { status: 'success' }

  const email = normalizeLine(raw.email).toLowerCase()
  if (!emailSchema.safeParse(email).success) return { status: 'error', email: email.slice(0, 254) }

  return (await deliverAlertSignup(email, newReference())) ? { status: 'success' } : { status: 'unavailable' }
}
