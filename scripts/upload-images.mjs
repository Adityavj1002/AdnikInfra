#!/usr/bin/env node
// Uploads the site's bundled images to Cloudinary under the ids src/lib/cloud-images.ts expects,
// so the image loader can serve them from Cloudinary's CDN. Safe to re-run: existing files are
// skipped unless --force is given.
//   node --env-file=.env.local scripts/upload-images.mjs [--force]
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env
if (!cloud || !key || !secret) {
  console.error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (e.g. node --env-file=.env.local …).')
  process.exit(1)
}
const force = process.argv.includes('--force')
const IMAGE = /\.(jpe?g|png|webp|mp4)$/i

// Folder on disk → folder on Cloudinary. Keep in step with src/lib/cloud-images.ts.
const folders = [
  ['src/assets/images', 'adnik/site'],
  ['src/assets/images/liv-prime', 'adnik/projects/liv-prime'],
  ['src/assets/images/villas-skit', 'adnik/projects/villas-skit'],
  ['public/brand', 'adnik/site'],
  // Films and their posters (src/features/projects/content.ts streams them from here).
  ['public/media', 'adnik/media'],
]

const sign = (params) =>
  createHash('sha1')
    .update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&') + secret)
    .digest('hex')

let uploaded = 0
let skipped = 0
for (const [dir, folder] of folders) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- dir comes from the fixed list above
  for (const file of (await readdir(dir, { withFileTypes: true })).filter((f) => f.isFile() && IMAGE.test(f.name))) {
    const publicId = `${folder}/${basename(file.name, extname(file.name))}`
    const kind = extname(file.name).toLowerCase() === '.mp4' ? 'video' : 'image'
    if (!force) {
      const head = await fetch(`https://res.cloudinary.com/${cloud}/${kind}/upload/${publicId}${kind === 'video' ? '.mp4' : ''}`, { method: 'HEAD' })
      if (head.ok) {
        skipped += 1
        continue
      }
    }
    const params = { overwrite: 'true', public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) }
    const body = new FormData()
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file listed from that fixed folder
    body.set('file', new Blob([await readFile(join(dir, file.name))]), file.name)
    for (const [k, v] of Object.entries({ ...params, api_key: key, signature: sign(params) })) body.set(k, v)
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${kind}/upload`, { method: 'POST', body })
    const result = await response.json()
    if (!response.ok) {
      console.error(`✗ ${publicId}: ${result.error?.message ?? response.status}`)
      process.exitCode = 1
      continue
    }
    uploaded += 1
    console.log(`✓ ${publicId} (${result.width}×${result.height})`)
  }
}
console.log(`${uploaded} uploaded, ${skipped} already on Cloudinary.`)
