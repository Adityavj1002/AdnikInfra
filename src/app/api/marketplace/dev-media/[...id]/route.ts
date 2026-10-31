import { NextResponse } from 'next/server'
import { devUploadsEnabled, readDevPhoto } from '@/features/marketplace/media'

/** Memory mode only: serves photos uploaded through /api/marketplace/dev-upload. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string[] }> }) {
  if (!devUploadsEnabled) return new NextResponse(null, { status: 404 })
  const photo = readDevPhoto((await params).id.join('/'))
  if (!photo) return new NextResponse(null, { status: 404 })
  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      'Content-Type': photo.type,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  })
}
