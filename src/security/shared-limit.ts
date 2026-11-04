import 'server-only'
import { createHash } from 'node:crypto'
import { env } from './env'
import { createFailureCounter, createRateLimiter, type RateLimitResult, type RateLimiterOptions } from './rate-limit'

/**
 * Rate limits shared by every server instance through Upstash Redis (REST, no client library).
 * Without Redis, or when it is slow or down, the in-memory limiter of this instance decides:
 * an outage never locks people out and never turns the limits off entirely.
 */

type Command = readonly (string | number)[]
const TIMEOUT_MS = 1000

const redisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)

async function pipeline(commands: readonly Command[]): Promise<readonly unknown[]> {
  const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`redis ${response.status}`)
  const results = (await response.json()) as readonly { result?: unknown; error?: string }[]
  const failed = results.find((r) => r.error)
  if (failed) throw new Error(`redis ${failed.error}`)
  return results.map((r) => r.result)
}

// Keys are hashed: email addresses and IPs never sit in Redis in the clear.
const redisKey = (name: string, key: string) => `rl:${name}:${createHash('sha256').update(key).digest('base64url').slice(0, 22)}`

let warned = false
const fallback = (error: unknown) => {
  if (!warned) console.error(`[rate-limit] redis unavailable, using memory ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
  warned = true
}

export function createSharedLimiter(name: string, options: RateLimiterOptions): (key: string) => Promise<RateLimitResult> {
  const local = createRateLimiter(options)
  if (!redisConfigured) return async (key) => local(key)
  return async (key) => {
    const id = redisKey(name, key)
    try {
      const [count, , ttl] = await pipeline([['INCR', id], ['PEXPIRE', id, options.windowMs, 'NX'], ['PTTL', id]])
      const used = Number(count)
      const allowed = used <= options.limit
      return { allowed, remaining: Math.max(0, options.limit - used), retryAfterSeconds: allowed ? 0 : Math.ceil(Math.max(Number(ttl), 0) / 1000) }
    } catch (error) {
      fallback(error)
      return local(key)
    }
  }
}

export type SharedFailureCounter = Readonly<{
  blocked: (key: string) => Promise<boolean>
  fail: (key: string) => Promise<void>
  clear: (key: string) => Promise<void>
}>

/** Counts failures only (sign-ins), shared across instances like the limiter above. */
export function createSharedFailureCounter(name: string, options: RateLimiterOptions): SharedFailureCounter {
  const local = createFailureCounter(options)
  if (!redisConfigured) {
    return { blocked: async (key) => local.blocked(key), fail: async (key) => local.fail(key), clear: async (key) => local.clear(key) }
  }
  return {
    blocked: async (key) => {
      try {
        const [count] = await pipeline([['GET', redisKey(name, key)]])
        return Number(count ?? 0) >= options.limit
      } catch (error) {
        fallback(error)
        return local.blocked(key)
      }
    },
    fail: async (key) => {
      local.fail(key)
      const id = redisKey(name, key)
      await pipeline([['INCR', id], ['PEXPIRE', id, options.windowMs, 'NX']]).catch(fallback)
    },
    clear: async (key) => {
      local.clear(key)
      await pipeline([['DEL', redisKey(name, key)]]).catch(fallback)
    },
  }
}
