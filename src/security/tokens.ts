import 'server-only'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** 256 bits from the CSPRNG, URL-safe: confirmation links and session cookies. */
export function randomToken(): string {
  return randomBytes(32).toString('base64url')
}

/** What the database stores in place of a token, so a leaked table can't be replayed. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/

export function isTokenShape(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_SHAPE.test(value)
}

/** HMAC-SHA256 over `purpose:value`, so a signature made for one purpose fits no other. */
export function sign(secret: string, purpose: string, value: string): string {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('base64url')
}

export function verifySignature(secret: string, purpose: string, value: string, signature: string): boolean {
  const expected = Buffer.from(sign(secret, purpose, value))
  const given = Buffer.from(signature)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
