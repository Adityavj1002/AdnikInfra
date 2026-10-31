import type { NextConfig } from 'next'
import { staticSecurityHeaders } from './src/security/headers'
// Validates every environment variable when the app builds or starts. A misconfiguration
// (say, LEADS_MODE=email without SMTP) stops the deploy instead of serving 500s on every page.
import './src/security/env'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Pin the root so a stray lockfile in a parent directory is never picked up.
  turbopack: { root: __dirname },
  images: {
    // AVIF first (~20% smaller than WebP for photos); browsers without it get WebP, then JPEG.
    formats: ['image/avif', 'image/webp'],
  },
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
