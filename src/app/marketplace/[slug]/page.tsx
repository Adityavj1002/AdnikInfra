import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import blocks from '@/components/ui/blocks.module.css'
import { EnquiryForm } from '@/features/enquiry/EnquiryForm'
import { listingKindLabels, listingPurposeLabels } from '@/features/marketplace/constants'
import { listingArea, listingPlace, listingPrice } from '@/features/marketplace/format'
import { ListingPhotos } from '@/features/marketplace/ListingPhotos'
import { photoBase, photoUrl } from '@/features/marketplace/media'
import styles from '@/features/marketplace/marketplace.module.css'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import { isSlug } from '@/lib/slug'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, marketplaceListingNode, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

type Params = Readonly<{ params: Promise<{ slug: string }> }>

/** Only approved listings exist as far as the public is concerned. */
const liveListing = cache(async (slug: string) => {
  if (!marketplaceEnabled || !isSlug(slug)) return undefined
  const listing = await (await getStore()).getListingBySlug(slug)
  return listing?.status === 'approved' ? listing : undefined
})

const titleFor = (name: string, place: string) => buildTitle({ name: `${name}, ${place}`.slice(0, 70) }).title

export async function generateMetadata({ params }: Params) {
  const listing = await liveListing((await params).slug)
  if (!listing) return {}
  const description = `${listingKindLabels[listing.kind]} ${listingPurposeLabels[listing.purpose].toLowerCase()} in ${listingPlace(listing)}: ${listingArea(listing)}, ${listingPrice(listing)}. Checked by the Adnik Infra team.`
  return buildMetadata({
    title: titleFor(listing.title, listing.locality),
    description: description.slice(0, 160),
    path: routes.marketplaceListing(listing.slug),
  })
}

export default async function MarketplaceListingPage({ params }: Params) {
  const listing = await liveListing((await params).slug)
  if (!listing) notFound()
  const path = routes.marketplaceListing(listing.slug)
  const crumbs: readonly Crumb[] = [
    { name: 'Home', path: routes.home },
    { name: 'Marketplace', path: routes.marketplace },
    { name: listing.title, path },
  ]
  // Seller contact details stay on the server: nothing below renders them.
  const images = listing.images.map((photo) => photoUrl(photo.id, 1200, env.SITE_URL))

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path, name: listing.title, description: listing.description.slice(0, 160), breadcrumb: true }),
          breadcrumbNode(path, crumbs),
          marketplaceListingNode(listing, images),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <div className="section section--tight">
        <div className={`container ${blocks.detail}`}>
          <div className="stack">
            <p className="eyebrow">
              {listingKindLabels[listing.kind]} · {listingPurposeLabels[listing.purpose]}
            </p>
            <h1>{listing.title}</h1>
            <p>{listingPlace(listing)}, {listing.state}</p>
            <p className={styles.price}>{listingPrice(listing)}</p>
            <ListingPhotos photos={listing.images} base={photoBase()} title={listing.title} />
            <section className={blocks.block} aria-labelledby="details-title">
              <h2 id="details-title" className={blocks.blockTitle}>Details</h2>
              <dl className={styles.specs}>
                <div><dt>Area</dt><dd>{listingArea(listing)}</dd></div>
                {listing.bedrooms ? <div><dt>Bedrooms</dt><dd>{listing.bedrooms} BHK</dd></div> : null}
                <div><dt>Reference</dt><dd>{listing.reference}</dd></div>
              </dl>
              <p className={styles.description}>{listing.description}</p>
            </section>
            <p className={styles.notice}>
              Listed by its {listing.sellerRole === 'owner' ? 'owner' : listing.sellerRole === 'agent' ? 'agent' : 'builder'} and
              checked by our team before publishing. Please verify title, approvals and measurements yourself before paying anything.
            </p>
          </div>
          <aside className={blocks.sticky} aria-labelledby="enquire-title">
            <div className={blocks.panel}>
              <h2 id="enquire-title" className={blocks.panelTitle}>Interested in this property?</h2>
              <p>Send your details. Our team will call you and arrange a visit.</p>
              <EnquiryForm variant="compact" about={{ slug: listing.slug, name: listing.title }} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
