/**
 * Security headers that never vary per request. Applied to every route from
 * next.config.ts; the nonce-bearing CSP is added separately in src/proxy.ts.
 */

export type HeaderEntry = Readonly<{ key: string; value: string }>

export const staticSecurityHeaders: readonly HeaderEntry[] = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-Frame-Options', value: 'DENY' },
]
