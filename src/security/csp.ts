/**
 * Content Security Policy builder (ARCHITECTURE.md §11.1).
 * Pure functions so the policy can be unit tested without a server.
 */

export const CSP_REPORT_PATH = '/api/csp-report'
export const CSP_REPORT_GROUP = 'csp-endpoint'

export type CspMode = 'report-only' | 'enforce'

export type CspOptions = Readonly<{
  nonce: string
  isDev: boolean
  siteUrl: string
  mediaOrigin?: string
}>

type Directives = Readonly<Record<string, readonly string[]>>

const NONCE_PATTERN = /^[A-Za-z0-9+/]{22}==$/

/** 128 bits from the platform CSPRNG, base64-encoded. */
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
}

export function buildCspDirectives({ nonce, isDev, siteUrl, mediaOrigin }: CspOptions): Directives {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new Error('CSP nonce must be 16 base64-encoded bytes.')
  }

  const nonceSource = `'nonce-${nonce}'`
  const media = mediaOrigin ? [mediaOrigin] : []
  const isHttps = siteUrl.startsWith('https://')

  return {
    'default-src': ["'self'"],
    // React needs eval in development only, for server error stack reconstruction.
    'script-src': ["'self'", nonceSource, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", ...(isDev ? ["'unsafe-inline'"] : [nonceSource])],
    // Server-rendered style attributes (CSS custom properties). They cannot execute script.
    'style-src-attr': ["'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...media],
    'media-src': ["'self'", ...media],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    ...(isHttps ? { 'upgrade-insecure-requests': [] } : {}),
    'report-uri': [CSP_REPORT_PATH],
    // The Reporting API only delivers to secure endpoints.
    ...(isHttps ? { 'report-to': [CSP_REPORT_GROUP] } : {}),
  }
}

export function serializeCsp(directives: Directives): string {
  return Object.entries(directives)
    .map(([name, sources]) => (sources.length > 0 ? `${name} ${sources.join(' ')}` : name))
    .join('; ')
}

export function buildCsp(options: CspOptions): string {
  return serializeCsp(buildCspDirectives(options))
}

export function cspHeaderName(mode: CspMode): string {
  return mode === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'
}

/** Value for the `Reporting-Endpoints` header, or null when the site is not served over https. */
export function reportingEndpoints(siteUrl: string): string | null {
  if (!siteUrl.startsWith('https://')) return null
  return `${CSP_REPORT_GROUP}="${new URL(CSP_REPORT_PATH, siteUrl).href}"`
}
