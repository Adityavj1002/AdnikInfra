import type { NextConfig } from 'next'
import { staticSecurityHeaders } from './src/security/headers'
// Validates every environment variable when the app builds or starts. A misconfiguration
// (say, LEADS_MODE=email without SMTP) stops the deploy instead of serving 500s on every page.
import { env } from './src/security/env'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Pin the root so a stray lockfile in a parent directory is never picked up.
  turbopack: { root: __dirname },
  // With Cloudinary configured, every image is resized and served by its CDN (src/lib/image-loader.ts),
  // which takes that work off this server. Without it, the built-in optimiser does the job.
  images: env.CLOUDINARY_CLOUD_NAME
    ? { loader: 'custom', loaderFile: './src/lib/image-loader.ts' }
    : {
        // AVIF first (~20% smaller than WebP for photos); browsers without it get WebP, then JPEG.
        formats: ['image/avif', 'image/webp'],
      },
  env: { NEXT_PUBLIC_IMAGE_CLOUD: env.CLOUDINARY_CLOUD_NAME ?? '' },
  experimental: {
    // Forms are small text payloads; nothing on this site uploads files.
    serverActions: { bodySizeLimit: '64kb' },
    proxyClientMaxBodySize: '128kb',
  },
  async redirects() {
    // Sectors live on the home page; each has its own page below /sectors/.
    return [{ source: '/sectors', destination: '/#sectors', permanent: false }]
  },
  async headers() {
    return [{ source: '/:path*', headers: [...staticSecurityHeaders] }]
  },
}

export default nextConfig
