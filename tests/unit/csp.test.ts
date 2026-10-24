import { describe, expect, it } from 'vitest'
import {
  buildCsp,
  buildCspDirectives,
  createNonce,
  cspHeaderName,
  reportingEndpoints,
  serializeCsp,
} from '@/security/csp'

const nonce = createNonce()
const prod = { nonce, isDev: false, siteUrl: 'https://vijaybuilders.example' }

describe('createNonce', () => {
  it('returns 16 random bytes as base64', () => {
    expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/)
    expect(atob(nonce)).toHaveLength(16)
  })

  it('never repeats across requests', () => {
    const seen = new Set(Array.from({ length: 500 }, createNonce))
    expect(seen.size).toBe(500)
  })
})

describe('buildCspDirectives (production)', () => {
  const d = buildCspDirectives(prod)

  it('allows scripts only via nonce + strict-dynamic', () => {
    expect(d['script-src']).toEqual(["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"])
  })

  it('never allows eval or inline script/style in production', () => {
    const policy = serializeCsp(d)
    expect(policy).not.toContain("'unsafe-eval'")
    expect(policy).not.toContain("'wasm-unsafe-eval'")
    expect(d['script-src']).not.toContain("'unsafe-inline'")
    expect(d['style-src']).not.toContain("'unsafe-inline'")
    expect(d['style-src']).toContain(`'nonce-${nonce}'`)
  })

  it('locks down framing, plugins, base and form targets', () => {
    expect(d['frame-ancestors']).toEqual(["'none'"])
    expect(d['object-src']).toEqual(["'none'"])
    expect(d['base-uri']).toEqual(["'none'"])
    expect(d['form-action']).toEqual(["'self'"])
  })

  it('upgrades insecure requests and uses the Reporting API on https', () => {
    expect(d['upgrade-insecure-requests']).toEqual([])
    expect(d['report-to']).toEqual(['csp-endpoint'])
    expect(d['report-uri']).toEqual(['/api/csp-report'])
  })
})

describe('buildCspDirectives (variants)', () => {
  it('adds unsafe-eval and inline styles only in development', () => {
    const d = buildCspDirectives({ ...prod, isDev: true })
    expect(d['script-src']).toContain("'unsafe-eval'")
    expect(d['style-src']).toContain("'unsafe-inline'")
  })

  it('omits https-only directives on plain http (local next start)', () => {
    const d = buildCspDirectives({ ...prod, siteUrl: 'http://localhost:3000' })
    expect(d).not.toHaveProperty('upgrade-insecure-requests')
    expect(d).not.toHaveProperty('report-to')
    expect(d['report-uri']).toEqual(['/api/csp-report'])
  })

  it('allows the media CDN for images and media only', () => {
    const d = buildCspDirectives({ ...prod, mediaOrigin: 'https://media.example.com' })
    expect(d['img-src']).toContain('https://media.example.com')
    expect(d['media-src']).toContain('https://media.example.com')
    expect(d['script-src']).not.toContain('https://media.example.com')
    expect(d['connect-src']).toEqual(["'self'"])
  })

  it('rejects a malformed nonce instead of emitting a broken policy', () => {
    expect(() => buildCsp({ ...prod, nonce: "abc'; script-src *" })).toThrow()
  })
})

describe('serialization and headers', () => {
  it('joins directives with "; " and writes valueless directives bare', () => {
    expect(serializeCsp({ 'default-src': ["'self'"], 'upgrade-insecure-requests': [] })).toBe(
      "default-src 'self'; upgrade-insecure-requests",
    )
  })

  it('maps the rollout mode to the right header', () => {
    expect(cspHeaderName('report-only')).toBe('Content-Security-Policy-Report-Only')
    expect(cspHeaderName('enforce')).toBe('Content-Security-Policy')
  })

  it('declares an absolute Reporting-Endpoints URL only on https', () => {
    expect(reportingEndpoints('https://vijaybuilders.example')).toBe(
      'csp-endpoint="https://vijaybuilders.example/api/csp-report"',
    )
    expect(reportingEndpoints('http://localhost:3000')).toBeNull()
  })
})
