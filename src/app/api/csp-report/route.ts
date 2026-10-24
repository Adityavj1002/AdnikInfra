import { PayloadTooLargeError, readBodyWithLimit } from '@/security/body'
import { MAX_REPORT_BYTES, normalizeCspReports } from '@/security/csp-report'
import { clientKey, createRateLimiter } from '@/security/rate-limit'

const ACCEPTED_TYPES = ['application/csp-report', 'application/reports+json', 'application/json']

// Per-client limit, plus a global ceiling because forwarding headers can be spoofed.
const perClient = createRateLimiter({ limit: 30, windowMs: 60_000 })
const globalLimit = createRateLimiter({ limit: 600, windowMs: 60_000 })

export async function POST(request: Request): Promise<Response> {
  const limited = [perClient(clientKey(request.headers)), globalLimit('all')].find((r) => !r.allowed)
  if (limited) {
    return new Response(null, {
      status: 429,
      headers: { 'Retry-After': String(limited.retryAfterSeconds) },
    })
  }

  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
  if (!ACCEPTED_TYPES.includes(contentType)) {
    return new Response(null, { status: 415 })
  }

  let raw: string
  try {
    raw = await readBodyWithLimit(request, MAX_REPORT_BYTES)
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return new Response(null, { status: 413 })
    throw error
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }

  for (const violation of normalizeCspReports(payload)) {
    // JSON.stringify keeps each report on one log line (no log injection via newlines).
    console.warn(`[csp] ${JSON.stringify(violation)}`)
  }

  return new Response(null, { status: 204 })
}
