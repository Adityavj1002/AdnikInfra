import 'server-only'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from 'node:crypto'

/**
 * Admin password hashing with scrypt (memory-hard, built into Node). Stored as
 * `scrypt$N$r$p$salt$hash` so the cost can be raised later without breaking old hashes.
 */

const N = 2 ** 15
const R = 8
const P = 1
const KEY_LENGTH = 64
// scrypt needs 128·N·r bytes; leave headroom over Node's 32 MB default.
const MAX_MEMORY = 64 * 1024 * 1024

export const PASSWORD_MIN = 12
export const PASSWORD_MAX = 200

function scrypt(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password.normalize('NFKC'), salt, KEY_LENGTH, options, (error, key) => (error ? reject(error) : resolve(key)))
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, { N, r: R, p: P, maxmem: MAX_MEMORY })
  return ['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join('$')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !n || !r || !p || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64url')
  if (expected.length !== KEY_LENGTH) return false
  const key = await scrypt(password, Buffer.from(salt, 'base64url'), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY,
  })
  return timingSafeEqual(key, expected)
}

let dummyHash: Promise<string> | undefined

/** Burns the same time as a real check, so a login can't reveal which emails are admins. */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword(randomBytes(18).toString('base64url'))
  await verifyPassword(password, await dummyHash)
  return false
}
