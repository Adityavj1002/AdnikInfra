export type RateLimitResult = Readonly<{
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}>

export type RateLimiterOptions = Readonly<{
  limit: number
  windowMs: number
  /** Upper bound on tracked keys; the oldest are evicted so a key flood cannot exhaust memory. */
  maxKeys?: number
  now?: () => number
}>

type Bucket = { count: number; resetAt: number }

/**
 * Fixed-window limiter held in process memory. It is per-instance, which is enough
 * for coarse abuse control on a single node; multi-instance deployments swap in a
 * shared store behind the same signature (ARCHITECTURE.md §11.2).
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: RateLimiterOptions): (key: string) => RateLimitResult {
  const buckets = new Map<string, Bucket>()

  return (key) => {
    const time = now()
    let bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= time) {
      bucket = { count: 0, resetAt: time + windowMs }
      buckets.delete(key)
      buckets.set(key, bucket)
      if (buckets.size > maxKeys) {
        const oldest = buckets.keys().next().value
        if (oldest !== undefined) buckets.delete(oldest)
      }
    }

    bucket.count += 1
    const allowed = bucket.count <= limit
    return {
      allowed,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: allowed ? 0 : Math.ceil((bucket.resetAt - time) / 1000),
    }
  }
}

/**
 * Best-effort client key for abuse limits. Forwarding headers are client-controlled
 * unless set by a trusted edge, so this must never be used for authorization.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return (forwarded || headers.get('x-real-ip') || 'anonymous').slice(0, 64)
}
