import { describe, expect, it } from 'vitest'
import { parseEnv } from '@/security/env'

describe('parseEnv', () => {
  it('applies safe defaults: report-only CSP, not indexable', () => {
    const env = parseEnv({})
    expect(env.SITE_URL).toBe('http://localhost:3000')
    expect(env.CSP_MODE).toBe('report-only')
    expect(env.SITE_INDEXABLE).toBe(false)
    expect(env.MEDIA_ORIGIN).toBeUndefined()
  })

  it('normalises URLs to their origin', () => {
    const env = parseEnv({
      SITE_URL: 'https://vijaybuilders.example/some/path?x=1',
      MEDIA_ORIGIN: 'https://media.example.com/videos/',
    })
    expect(env.SITE_URL).toBe('https://vijaybuilders.example')
    expect(env.MEDIA_ORIGIN).toBe('https://media.example.com')
  })

  it('treats an empty MEDIA_ORIGIN as unset', () => {
    expect(parseEnv({ MEDIA_ORIGIN: '' }).MEDIA_ORIGIN).toBeUndefined()
  })

  it.each([
    ['a non-http scheme', { SITE_URL: 'javascript:alert(1)' }],
    ['garbage', { SITE_URL: 'not a url' }],
    ['an unknown CSP mode', { CSP_MODE: 'off' }],
    ['a non-boolean flag', { SITE_INDEXABLE: 'yes' }],
    ['indexing over http', { SITE_INDEXABLE: 'true', SITE_URL: 'http://vijaybuilders.example' }],
  ])('rejects %s', (_label, source) => {
    expect(() => parseEnv(source)).toThrow(/Invalid environment/)
  })

  it('returns a frozen object', () => {
    expect(Object.isFrozen(parseEnv({}))).toBe(true)
  })
})
