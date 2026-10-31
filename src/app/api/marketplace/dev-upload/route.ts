import { NextResponse } from 'next/server'
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from '@/features/marketplace/constants'
import { devUploadsEnabled, saveDevPhoto } from '@/features/marketplace/media'

/** Memory mode only: stands in for Cloudinary so the sell flow works in development and e2e. */
export async function POST(request: Request) {
  if (!devUploadsEnabled) return new NextResponse(null, { status: 404 })
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > PHOTO_MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: 'too-large' }, { status: 413 })
  }
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || !(PHOTO_TYPES as readonly string[]).includes(file.type) || file.size > PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  const id = saveDevPhoto(new Uint8Array(await file.arrayBuffer()), file.type)
  return NextResponse.json({ public_id: id })
}
