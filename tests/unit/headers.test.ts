import { describe, expect, it } from 'vitest'
import { staticSecurityHeaders } from '@/security/headers'

const headers = new Map(staticSecurityHeaders.map(({ key, value }) => [key.toLowerCase(), value]))

describe('staticSecurityHeaders', () => {
  it.each([
    ['strict-transport-security', 'max-age=63072000; includeSubDomains; preload'],
    ['x-content-type-options', 'nosniff'],
    ['referrer-policy', 'strict-origin-when-cross-origin'],
    ['cross-origin-opener-policy', 'same-origin'],
    ['cross-origin-resource-policy', 'same-site'],
    ['x-frame-options', 'DENY'],
  ])('sets %s', (key, value) => {
    expect(headers.get(key)).toBe(value)
  })

  it('denies powerful features by default', () => {
    const policy = headers.get('permissions-policy') ?? ''
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment']) {
      expect(policy).toContain(`${feature}=()`)
    }
  })

  it('has no duplicate header names', () => {
    expect(headers.size).toBe(staticSecurityHeaders.length)
  })
})
