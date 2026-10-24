import { env } from '@/security/env'

const VALIDITY_DAYS = 180

/** RFC 9116 vulnerability-disclosure file. Served only once a contact is configured. */
export function GET(): Response {
  if (!env.SECURITY_CONTACT) return new Response('Not found', { status: 404 })

  const expires = new Date(Date.now() + VALIDITY_DAYS * 86_400_000).toISOString()
  const body = [
    `Contact: ${env.SECURITY_CONTACT}`,
    `Expires: ${expires}`,
    `Canonical: ${new URL('/.well-known/security.txt', env.SITE_URL).href}`,
    'Preferred-Languages: en',
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
