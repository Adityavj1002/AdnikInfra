import { unstable_doesMiddlewareMatch as doesProxyMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'
import { config } from '@/proxy'

const matches = (url: string, headers: Record<string, string> = {}) =>
  doesProxyMatch({ config, url, headers })

describe('proxy matcher: every document gets a CSP', () => {
  it.each([
    '/',
    '/estates',
    '/estates/haveli-courtyard-residence',
    '/journeys/stepwells-of-the-west',
    '/regions/some-region',
    // Prefix look-alikes must NOT be mistaken for excluded paths.
    '/apiary-estate',
    '/api-guide',
    '/icon-gallery',
    '/robots-and-ruins',
    '/_nextgen-living',
  ])('runs on %s', (url) => {
    expect(matches(url)).toBe(true)
  })

  it('still runs when a request claims to be a prefetch (no header-based bypass)', () => {
    expect(matches('/estates', { purpose: 'prefetch' })).toBe(true)
    expect(matches('/estates', { 'next-router-prefetch': '1' })).toBe(true)
  })
})

describe('proxy matcher: non-document paths are skipped', () => {
  it.each([
    '/api',
    '/api/csp-report',
    '/_next/static/chunks/main.js',
    '/_next/image',
    '/favicon.ico',
    '/icon.svg',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/security.txt',
    '/media/hero-dawn.avif',
    '/films/courtyard.mp4',
    '/films/courtyard.en.vtt',
  ])('skips %s', (url) => {
    expect(matches(url)).toBe(false)
  })
})
