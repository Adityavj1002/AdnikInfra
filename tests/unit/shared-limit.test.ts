import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function loadWithRedis() {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'a-token-long-enough-for-the-schema')
  vi.resetModules()
  return import('@/security/shared-limit')
}

describe('shared rate limits', () => {
  it('counts in Redis, with hashed keys, when Redis is configured', async () => {
    const calls: string[] = []
    let count = 0
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      calls.push(String(init.body))
      count += 1
      return new Response(JSON.stringify([{ result: count }, { result: 1 }, { result: 59_000 }]))
    })
    const { createSharedLimiter } = await loadWithRedis()
    const limit = createSharedLimiter('test', { limit: 2, windowMs: 60_000 })
    expect((await limit('someone@example.com')).allowed).toBe(true)
    expect((await limit('someone@example.com')).allowed).toBe(true)
    expect(await limit('someone@example.com')).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 59 })
    expect(calls.join(' ')).not.toContain('someone@example.com')
    expect(calls[0]).toContain('"PEXPIRE"')
  })

  it('falls back to this instance’s memory when Redis is down', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('connection refused')
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { createSharedLimiter, createSharedFailureCounter } = await loadWithRedis()
    const limit = createSharedLimiter('test', { limit: 1, windowMs: 60_000 })
    expect((await limit('a')).allowed).toBe(true)
    expect((await limit('a')).allowed).toBe(false)
    const failures = createSharedFailureCounter('test-failures', { limit: 1, windowMs: 60_000 })
    await failures.fail('b')
    expect(await failures.blocked('b')).toBe(true)
    await failures.clear('b')
    expect(await failures.blocked('b')).toBe(false)
  })
})
