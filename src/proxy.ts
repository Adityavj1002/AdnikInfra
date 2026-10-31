import { NextResponse, type NextRequest } from 'next/server'
import { buildCsp, createNonce, cspHeaderName, reportingEndpoints } from '@/security/csp'
import { env } from '@/security/env'

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'OPTIONS'])

/**
 * Issues a fresh nonce per document request and attaches the CSP to both the
 * request (Next.js reads the nonce from it while rendering) and the response.
 */
export function proxy(request: NextRequest) {
  // Pages answer GET and HEAD, server actions POST. Anything else has no business here.
  if (!ALLOWED_METHODS.has(request.method)) {
    return new NextResponse(null, { status: 405, headers: { Allow: [...ALLOWED_METHODS].join(', ') } })
  }

  const nonce = createNonce()
  const policy = buildCsp({
    nonce,
    isDev: env.NODE_ENV === 'development',
    siteUrl: env.SITE_URL,
    mediaOrigin: env.MEDIA_ORIGIN,
    ...(env.CLOUDINARY_CLOUD_NAME
      ? { imageOrigin: 'https://res.cloudinary.com', uploadOrigin: 'https://api.cloudinary.com' }
      : {}),
  })
  const headerName = cspHeaderName(env.CSP_MODE)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(headerName, policy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set(headerName, policy)

  const endpoints = reportingEndpoints(env.SITE_URL)
  if (endpoints) response.headers.set('Reporting-Endpoints', endpoints)

  // Belt and braces with the robots meta tag: previews must never be indexed.
  if (!env.SITE_INDEXABLE) response.headers.set('X-Robots-Tag', 'noindex, nofollow')

  return response
}

export const config = {
  matcher: [
    // Every document request. Exclusions are anchored to a path boundary, so look-alike
    // pages such as /apiary-estate are still covered. There is deliberately no header-based
    // skip (e.g. prefetch): request headers are client-controlled and must not disable the CSP.
    '/((?!api(?:/|$)|_next/static/|_next/image(?:/|$)|\\.well-known/|favicon\\.ico$|icon\\.svg$|robots\\.txt$|sitemap\\.xml$|.+\\.(?:avif|webp|png|jpe?g|gif|svg|ico|mp4|webm|vtt|woff2?|txt|xml)$).*)',
  ],
}
