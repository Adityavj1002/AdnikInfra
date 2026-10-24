import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { absoluteUrl } from '@/seo/schema'
import { env } from '@/security/env'

/**
 * Crawling stays open even on non-indexable deployments: blocking crawlers would stop
 * them seeing the noindex signals (meta + X-Robots-Tag) and could leave bare URLs indexed.
 * Protect previews with platform authentication instead.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection()
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: env.SITE_URL,
  }
}
