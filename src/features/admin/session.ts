import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import type { Admin } from '@/features/marketplace/types'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { hashToken, isTokenShape, randomToken } from '@/security/tokens'

const SECURE = env.SITE_URL.startsWith('https://')
// __Host- binds the cookie to this exact host over https. Plain http (localhost) can't use it.
const COOKIE = SECURE ? '__Host-adnik_admin' : 'adnik_admin'
const SESSION_HOURS = 12

export async function startSession(adminId: string): Promise<void> {
  const store = await getStore()
  const token = randomToken()
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3_600_000)
  await store.createSession(hashToken(token), adminId, expiresAt)
  await store.recordLogin(adminId)
  ;(await cookies()).set(COOKIE, token, { httpOnly: true, secure: SECURE, sameSite: 'lax', path: '/', expires: expiresAt })
}

export async function endSession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (isTokenShape(token) && marketplaceEnabled) await (await getStore()).deleteSession(hashToken(token))
  jar.delete(COOKIE)
}

/** The signed-in admin, checked against the database on every request. Memoised per render. */
export const currentAdmin = cache(async (): Promise<Admin | undefined> => {
  if (!marketplaceEnabled) return undefined
  const token = (await cookies()).get(COOKIE)?.value
  if (!isTokenShape(token)) return undefined
  const store = await getStore()
  const session = await store.getSession(hashToken(token))
  if (!session || session.expiresAt < new Date()) return undefined
  return store.getAdmin(session.adminId)
})

/** Every admin page and every admin action starts here: the proxy does not guard these routes. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await currentAdmin()
  if (!admin) redirect(routes.adminLogin)
  return admin
}
