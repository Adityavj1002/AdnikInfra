import { describe, expect, it } from 'vitest'
import { clientKey, createRateLimiter } from '@/security/rate-limit'

function clock(start = 0) {
  let time = start
  return { now: () => time, advance: (ms: number) => (time += ms) }
}

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks with Retry-After', () => {
    const c = clock()
    const check = createRateLimiter({ limit: 3, windowMs: 10_000, now: c.now })
    expect([check('a'), check('a'), check('a')].every((r) => r.allowed)).toBe(true)
    const blocked = check('a')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(10)
  })

  it('resets after the window', () => {
    const c = clock()
    const check = createRateLimiter({ limit: 1, windowMs: 1_000, now: c.now })
    check('a')
    expect(check('a').allowed).toBe(false)
    c.advance(1_000)
    expect(check('a').allowed).toBe(true)
  })

  it('tracks keys independently', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000 })
    check('a')
    expect(check('b').allowed).toBe(true)
  })

  it('stays bounded under a flood of unique keys', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 100 })
    for (let i = 0; i < 10_000; i++) check(`ip-${i}`)
    // The earliest key was evicted, so it starts a fresh window.
    expect(check('ip-0').allowed).toBe(true)
  })
})

describe('clientKey', () => {
  it('uses the first forwarded address', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
  })

  it('falls back safely and caps length', () => {
    expect(clientKey(new Headers())).toBe('anonymous')
    expect(clientKey(new Headers({ 'x-real-ip': 'x'.repeat(500) }))).toHaveLength(64)
  })
})
