import 'server-only'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { sign, verifySignature } from '@/security/tokens'
import { signingSecret } from './runtime'

/**
 * Unsubscribe links carry the address and an HMAC of it, so they work forever without a
 * database lookup, and nobody can unsubscribe an address they don't hold a link for.
 */

const PURPOSE = 'unsubscribe'

const encode = (email: string) => Buffer.from(email, 'utf8').toString('base64url')

export function unsubscribeParams(email: string): Readonly<{ e: string; s: string }> {
  return { e: encode(email), s: sign(signingSecret(), PURPOSE, email) }
}

/** The page a person lands on (asks before acting, so link scanners can't unsubscribe them). */
export function unsubscribeUrl(email: string): string {
  const url = new URL(routes.unsubscribe, env.SITE_URL)
  const { e, s } = unsubscribeParams(email)
  url.searchParams.set('e', e)
  url.searchParams.set('s', s)
  return url.href
}

/** RFC 8058 one-click endpoint, for the List-Unsubscribe header mail apps show as a button. */
export function oneClickUrl(email: string): string {
  const url = new URL('/api/unsubscribe', env.SITE_URL)
  const { e, s } = unsubscribeParams(email)
  url.searchParams.set('e', e)
  url.searchParams.set('s', s)
  return url.href
}

export function listUnsubscribeHeaders(email: string): Readonly<Record<string, string>> {
  return {
    'List-Unsubscribe': `<${oneClickUrl(email)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

/** The email address a link was made for, or undefined if it was altered. */
export function readUnsubscribe(e: unknown, s: unknown): string | undefined {
  if (typeof e !== 'string' || typeof s !== 'string' || e.length > 400 || s.length > 100) return undefined
  const email = Buffer.from(e, 'base64url').toString('utf8')
  return verifySignature(signingSecret(), PURPOSE, email, s) ? email : undefined
}
