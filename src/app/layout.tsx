// Design-system CSS must be imported before any component: the first stylesheet to name a
// cascade layer fixes the layer order, so layers.css has to be parsed first.
import '@/design/layers.css'
import '@/design/tokens.css'
import '@/design/reset.css'
import '@/design/base.css'
import '@/design/grid.css'
import '@/design/primitives.css'
import '@/design/utilities.css'
import type { Metadata, Viewport } from 'next'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { JsonLd } from '@/components/seo/JsonLd'
import { site } from '@/config/site'
import { display, displayRupee, text, textRupee } from '@/design/fonts'
import { graph, siteNodes } from '@/seo/schema'
import { env } from '@/security/env'

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: `${site.name} | ${site.descriptor} in ${site.city}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Icons come from the file conventions in this folder: favicon.ico, icon.svg, apple-icon.png.
  formatDetection: { telephone: false, email: false, address: false },
  // Previews and staging must never be indexed; production opts in via SITE_INDEXABLE.
  robots: env.SITE_INDEXABLE ? undefined : { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Full-bleed on notched phones; safe-area insets keep content clear.
  viewportFit: 'cover',
  themeColor: '#ffffff',
  // "only" also opts out of Chrome's auto-darkening, which would invert the cream and gold palette.
  colorScheme: 'only light',
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Nonce-based CSP requires every page to render per request.
  await connection()

  return (
    <html lang={site.language} className={`${display.variable} ${text.variable} ${displayRupee.variable} ${textRupee.variable}`}>
      <body>
        <JsonLd graph={graph(...siteNodes())} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
