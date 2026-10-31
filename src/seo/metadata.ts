import type { Metadata } from 'next'
import { site } from '@/config/site'

export type PageSeo = Readonly<{
  title: string
  socialTitle?: string
  /** 50–160 characters; checked in e2e for every route. */
  description: string
  /** Path only; made absolute through metadataBase. Query strings are never canonical. */
  path: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  /** Filtered or utility views: kept out of the index but still crawlable. */
  noindex?: boolean
  /**
   * Set when the route has its own opengraph-image file. Otherwise the site card is used:
   * a page-level openGraph object replaces the parent's, so the image must be restated.
   */
  ownImage?: boolean
  /** A share image for this page alone, as an absolute URL (a listing's first photo). */
  image?: string
}>

const defaultImage = { url: '/opengraph-image', width: 1200, height: 630, alt: `${site.name}: ${site.descriptor}` }

export function buildMetadata(seo: PageSeo): Metadata {
  const socialTitle = seo.socialTitle ?? seo.title
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: seo.path },
    openGraph: {
      type: seo.type ?? 'website',
      url: seo.path,
      siteName: site.name,
      locale: site.ogLocale,
      title: socialTitle,
      description: seo.description,
      ...(seo.image ? { images: [{ url: seo.image }] } : seo.ownImage ? {} : { images: [defaultImage] }),
      ...(seo.type === 'article'
        ? { publishedTime: seo.publishedTime, modifiedTime: seo.modifiedTime }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: seo.description,
      ...(seo.image ? { images: [seo.image] } : seo.ownImage ? {} : { images: [defaultImage.url] }),
    },
    // Only ever narrows: a page can opt out of the index, never opt a staging site in.
    ...(seo.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
