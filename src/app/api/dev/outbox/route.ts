import { NextResponse } from 'next/server'
import { devOutbox } from '@/features/email/mailer'
import { env } from '@/security/env'

/** Memory mode with logged mail only (development, e2e): lets tests follow emailed links. */
export function GET() {
  if (env.MARKETPLACE_MODE !== 'memory' || env.LEADS_MODE !== 'log') return new NextResponse(null, { status: 404 })
  return NextResponse.json(devOutbox(), { headers: { 'Cache-Control': 'no-store' } })
}
