import { NextResponse, type NextRequest } from 'next/server'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import { readUnsubscribe } from '@/features/marketplace/subscriptions'

/**
 * RFC 8058 one-click unsubscribe: mail apps POST here when someone presses their built-in
 * "Unsubscribe" button. The signed address in the URL is the only authority needed.
 */
export async function POST(request: NextRequest) {
  if (!marketplaceEnabled) return new NextResponse(null, { status: 404 })
  const { searchParams } = request.nextUrl
  const email = readUnsubscribe(searchParams.get('e'), searchParams.get('s'))
  if (!email) return new NextResponse(null, { status: 400 })
  try {
    await (await getStore()).unsubscribe(email)
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
