'use client'

import { cloudImages } from './cloud-images'

/**
 * Every next/image goes through here when Cloudinary is configured (next.config.ts): bundled
 * images and uploads are resized and converted (AVIF/WebP) by Cloudinary's CDN instead of this
 * server. The cloud name is inlined at build time; it is public in every image URL anyway.
 */
const cloud = process.env.NEXT_PUBLIC_IMAGE_CLOUD ?? ''
const base = `https://res.cloudinary.com/${cloud}/image/upload/`

/** /_next/static/media/<name>.<hash>.<ext> for imports, /brand/<name>.<ext> for public files. */
function bundledName(src: string): string {
  if (!src.startsWith('/_next/static/media/') && !src.startsWith('/brand/')) return ''
  return src.slice(src.lastIndexOf('/') + 1).split('.')[0] ?? ''
}

export default function cloudinaryLoader({ src, width }: Readonly<{ src: string; width: number; quality?: number }>): string {
  const transform = `f_auto,q_auto,c_limit,w_${width}`
  if (cloud && src.startsWith(base)) return `${base}${transform}/${src.slice(base.length)}`
  const name = bundledName(src)
  const id = Object.hasOwn(cloudImages, name) ? cloudImages[name] : undefined
  // Anything not on Cloudinary is served as it is (the built-in optimiser is off with a custom loader).
  return cloud && id ? `${base}${transform}/${id}` : src
}
