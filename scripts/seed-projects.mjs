// Puts the first projects (supabase/seed/projects.json) into a fresh Supabase database. After
// that every project is managed in Admin → Projects; nothing about a project is in the code.
//
//   node --env-file=.env.local scripts/seed-projects.mjs           # adds the ones that are missing
//   node --env-file=.env.local scripts/seed-projects.mjs --check   # only reports
//
// A project that already exists is never overwritten: admin edits win. If the home page has no
// featured project yet, the first seeded project becomes featured.
import { readFile } from 'node:fs/promises'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (for example in .env.local).')
  process.exit(1)
}
const checkOnly = process.argv.includes('--check')
// A fixed file next to this script, never user input.
// eslint-disable-next-line security/detect-non-literal-fs-filename
const seed = JSON.parse(await readFile(new URL('../supabase/seed/projects.json', import.meta.url), 'utf8'))

async function rest(path, init = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${response.status} ${await response.text()}`)
  const body = await response.text()
  return body ? JSON.parse(body) : null
}

const existing = new Set((await rest('project_content?select=slug')).map((row) => row.slug))
const missing = seed.filter((item) => !existing.has(item.slug))
for (const item of seed) console.log(`${existing.has(item.slug) ? 'exists ' : 'missing'}  ${item.slug}`)

if (!checkOnly && missing.length > 0) {
  const now = new Date().toISOString()
  await rest('project_content', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(missing.map((item) => ({ slug: item.slug, data: item.record, updated_at: now }))),
  })
  console.log(`Added ${missing.length} project(s).`)
}

const featured = await rest('site_settings?select=value&key=eq.featured_project')
if (featured.length === 0 && !checkOnly && seed[0]) {
  await rest('site_settings', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify([{ key: 'featured_project', value: seed[0].slug, updated_at: new Date().toISOString() }]),
  })
  console.log(`Featured on the home page: ${seed[0].slug}`)
} else {
  console.log(`Featured on the home page: ${featured[0]?.value ?? '(not set)'}`)
}
