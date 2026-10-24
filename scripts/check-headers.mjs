// Smoke-tests security headers against a running server (`next start`).
// Usage: BASE_URL=http://localhost:3000 node scripts/check-headers.mjs
import assert from 'node:assert/strict'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const failures = []

async function check(name, fn) {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
  } catch (error) {
    failures.push(name)
    console.error(`  ✗ ${name}\n    ${error.message}`)
  }
}

function cspOf(response) {
  const enforce = response.headers.get('content-security-policy')
  const reportOnly = response.headers.get('content-security-policy-report-only')
  return enforce ?? reportOnly
}

function nonceOf(policy) {
  return policy?.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1]
}

const first = await fetch(`${base}/`)
const html = await first.text()
const second = await fetch(`${base}/`)
await second.text()

console.log(`Security header checks against ${base}`)

await check('home responds 200', () => assert.equal(first.status, 200))

await check('CSP header present with a nonce', () => {
  const policy = cspOf(first)
  assert.ok(policy, 'no Content-Security-Policy(-Report-Only) header')
  assert.ok(nonceOf(policy), 'policy has no nonce source')
  assert.match(policy, /'strict-dynamic'/)
  assert.match(policy, /frame-ancestors 'none'/)
  assert.doesNotMatch(policy, /'unsafe-eval'/, 'unsafe-eval must not ship in production')
})

await check('nonce rotates per request', () => {
  assert.notEqual(nonceOf(cspOf(first)), nonceOf(cspOf(second)))
})

await check('every executable <script> carries the request nonce', () => {
  const nonce = nonceOf(cspOf(first))
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1])
  const executable = scripts.filter((attrs) => !/type="application\/(ld\+)?json"/.test(attrs))
  assert.ok(executable.length > 0, 'no scripts found in HTML')
  const missing = executable.filter((attrs) => !attrs.includes(`nonce="${nonce}"`))
  assert.equal(missing.length, 0, `${missing.length} script tag(s) without the nonce`)
})

await check('static security headers present', () => {
  const expected = {
    'strict-transport-security': /max-age=\d+/,
    'x-content-type-options': /^nosniff$/,
    'referrer-policy': /^strict-origin-when-cross-origin$/,
    'permissions-policy': /camera=\(\)/,
    'cross-origin-opener-policy': /^same-origin$/,
    'x-frame-options': /^DENY$/,
  }
  for (const [key, pattern] of Object.entries(expected)) {
    assert.match(first.headers.get(key) ?? '', pattern, `${key} missing or wrong`)
  }
})

await check('X-Powered-By is not advertised', () => {
  assert.equal(first.headers.get('x-powered-by'), null)
})

await check('pre-launch pages are noindex', () => {
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/)
})

const report = (body, type = 'application/csp-report') =>
  fetch(`${base}/api/csp-report`, { method: 'POST', headers: { 'content-type': type }, body })

await check('csp-report accepts a valid report (204)', async () => {
  const res = await report(JSON.stringify({ 'csp-report': { 'blocked-uri': 'inline' } }))
  assert.equal(res.status, 204)
})

await check('csp-report rejects wrong content type (415)', async () => {
  assert.equal((await report('{}', 'text/html')).status, 415)
})

await check('csp-report rejects malformed JSON (400)', async () => {
  assert.equal((await report('{nope')).status, 400)
})

await check('csp-report rejects oversized bodies (413)', async () => {
  assert.equal((await report('x'.repeat(20_000))).status, 413)
})

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`)
  process.exit(1)
}
console.log('\nAll header checks passed.')
