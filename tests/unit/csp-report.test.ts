import { describe, expect, it } from 'vitest'
import { PayloadTooLargeError, readBodyWithLimit } from '@/security/body'
import { cleanField, normalizeCspReports } from '@/security/csp-report'

describe('normalizeCspReports', () => {
  it('reads the legacy report-uri format', () => {
    const reports = normalizeCspReports({
      'csp-report': {
        'document-uri': 'https://vijaybuilders.example/',
        'violated-directive': 'script-src-elem',
        'blocked-uri': 'https://evil.example/x.js',
        disposition: 'report',
      },
    })
    expect(reports).toEqual([
      {
        documentUrl: 'https://vijaybuilders.example/',
        directive: 'script-src-elem',
        blocked: 'https://evil.example/x.js',
        disposition: 'report',
      },
    ])
  })

  it('reads Reporting API batches and ignores non-CSP report types', () => {
    const reports = normalizeCspReports([
      {
        type: 'csp-violation',
        body: {
          documentURL: 'https://vijaybuilders.example/estates',
          effectiveDirective: 'img-src',
          blockedURL: 'https://tracker.example/p.gif',
          disposition: 'enforce',
        },
      },
      { type: 'deprecation', body: {} },
    ])
    expect(reports).toHaveLength(1)
    expect(reports[0]?.directive).toBe('img-src')
  })

  it.each([null, 42, 'text', {}, [{ nope: true }]])('returns nothing for junk: %j', (payload) => {
    expect(normalizeCspReports(payload)).toEqual([])
  })

  it('refuses oversized batches', () => {
    const batch = Array.from({ length: 21 }, () => ({ type: 'csp-violation', body: {} }))
    expect(normalizeCspReports(batch)).toEqual([])
  })
})

describe('cleanField', () => {
  it('strips control and line-separator characters (log injection)', () => {
    expect(cleanField('a\nb\r\u0000c\u2028d')).toBe('abcd')
  })

  it('caps length', () => {
    expect(cleanField('x'.repeat(5000))).toHaveLength(300)
  })
})

describe('readBodyWithLimit', () => {
  const post = (body: string, headers: Record<string, string> = {}) =>
    new Request('https://vijaybuilders.example/api/csp-report', { method: 'POST', body, headers })

  it('returns the body when within the limit', async () => {
    await expect(readBodyWithLimit(post('{"ok":true}'), 64)).resolves.toBe('{"ok":true}')
  })

  it('rejects early on a declared oversize Content-Length', async () => {
    await expect(readBodyWithLimit(post('{}', { 'content-length': '999999' }), 64)).rejects.toThrow(
      PayloadTooLargeError,
    )
  })

  it('rejects while streaming when the real body exceeds the limit', async () => {
    await expect(readBodyWithLimit(post('x'.repeat(100)), 64)).rejects.toThrow(PayloadTooLargeError)
  })
})
