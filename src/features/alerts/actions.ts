'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { sendEmail } from '@/features/email/mailer'
import { subscribeConfirmEmail, subscribeWelcomeEmail } from '@/features/marketplace/emails'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import { listUnsubscribeHeaders, readUnsubscribe, unsubscribeUrl } from '@/features/marketplace/subscriptions'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { normalizeLine, pickFields } from '@/security/normalize'
import { clientKey, createRateLimiter } from '@/security/rate-limit'
import { hashToken, isTokenShape, randomToken } from '@/security/tokens'
import type { AlertsState, SubscriptionActionState } from './constants'

const perClient = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 })
const globalLimit = createRateLimiter({ limit: 200, windowMs: 10 * 60_000 })
const confirmLimit = createRateLimiter({ limit: 20, windowMs: 10 * 60_000 })
const emailSchema = z.email().max(254)
const FIELDS = ['email', 'website'] as const

/**
 * The subscribe form: double opt-in. Nobody gets promotional mail until they click the link
 * in the confirmation email. The answer is the same whether or not the address already
 * subscribed, so the form can't be used to find out who is on the list.
 */
export async function subscribeAlerts(_previous: AlertsState, form: FormData): Promise<AlertsState> {
  const key = clientKey(await headers())
  if (!perClient(key).allowed || !globalLimit('all').allowed) return { status: 'rate-limited' }

  const raw = pickFields(form, FIELDS)
  // Honeypot: bots get a convincing success.
  if (normalizeLine(raw.website) !== '') return { status: 'success' }

  const email = normalizeLine(raw.email).toLowerCase()
  if (!emailSchema.safeParse(email).success) return { status: 'error', email: email.slice(0, 254) }
  if (!marketplaceEnabled) return { status: 'unavailable' }

  try {
    const store = await getStore()
    const token = randomToken()
    const outcome = await store.subscribe(email, hashToken(token), 'website')
    if (outcome === 'already-active') return { status: 'success' }
    const confirmUrl = new URL(routes.subscribeConfirm, env.SITE_URL)
    confirmUrl.searchParams.set('token', token)
    const sent = await sendEmail({ to: { address: email }, message: subscribeConfirmEmail(confirmUrl.href), tag: 'subscribe-confirm' })
    return sent ? { status: 'success' } : { status: 'unavailable' }
  } catch (error) {
    console.error(`[subscribe] failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return { status: 'unavailable' }
  }
}

/** A button on the confirm page, not the link itself: mail scanners follow links. */
export async function confirmSubscription(_previous: SubscriptionActionState, form: FormData): Promise<SubscriptionActionState> {
  if (!marketplaceEnabled) return { status: 'unavailable' }
  if (!confirmLimit(clientKey(await headers())).allowed) return { status: 'unavailable' }
  const token = form.get('token')
  if (!isTokenShape(token)) return { status: 'invalid' }
  try {
    const store = await getStore()
    const subscriber = await store.confirmSubscriber(hashToken(token))
    if (!subscriber) return { status: 'invalid' }
    await sendEmail({
      to: { address: subscriber.email },
      message: subscribeWelcomeEmail(unsubscribeUrl(subscriber.email)),
      headers: listUnsubscribeHeaders(subscriber.email),
      tag: 'subscribe-welcome',
    })
    return { status: 'done' }
  } catch (error) {
    console.error(`[subscribe] confirm failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return { status: 'unavailable' }
  }
}

export async function unsubscribeAction(_previous: SubscriptionActionState, form: FormData): Promise<SubscriptionActionState> {
  if (!marketplaceEnabled) return { status: 'unavailable' }
  const email = readUnsubscribe(form.get('e'), form.get('s'))
  if (!email) return { status: 'invalid' }
  try {
    const store = await getStore()
    await store.unsubscribe(email)
    return { status: 'done' }
  } catch (error) {
    console.error(`[subscribe] unsubscribe failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return { status: 'unavailable' }
  }
}
