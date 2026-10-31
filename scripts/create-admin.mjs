#!/usr/bin/env node
// Creates the first admin in Supabase, since nobody can sign in to add one until one exists.
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/create-admin.mjs "Name" email@example.com
// The password is read from the ADMIN_PASSWORD environment variable, so it stays out of shell history
// if you set it with a leading space or from a file. Hash format matches src/security/password.ts.
import { randomBytes, scrypt } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const [name, rawEmail] = process.argv.slice(2)
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD } = process.env
if (!name || !rawEmail || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
  console.error('Usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ADMIN_PASSWORD=… node scripts/create-admin.mjs "Name" email')
  process.exit(1)
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.')
  process.exit(1)
}

const N = 2 ** 15
const R = 8
const P = 1
const salt = randomBytes(16)
const key = await new Promise((resolve, reject) => {
  scrypt(ADMIN_PASSWORD.normalize('NFKC'), salt, 64, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (error, derived) =>
    error ? reject(error) : resolve(derived),
  )
})
const passwordHash = ['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join('$')

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const { error } = await db.from('admins').insert({ name, email: rawEmail.toLowerCase(), password_hash: passwordHash })
if (error) {
  console.error(`Could not create the admin: ${error.code} ${error.message}`)
  process.exit(1)
}
console.log(`Admin created: ${rawEmail.toLowerCase()}`)
