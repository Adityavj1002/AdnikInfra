import { ArrowUpRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import cards from '@/components/ui/Cards.module.css'
import { routes } from '@/lib/routes'
import { listingKindLabels, listingPurposeLabels } from './constants'
import { listingArea, listingPlace, listingPrice } from './format'
import { MarketImage } from './MarketImage'
import type { PublicListing } from './types'

export function ListingCard({ listing, base }: Readonly<{ listing: PublicListing; base: string }>) {
  const cover = listing.images[0]
  return (
    <article className={cards.card}>
      <Link href={routes.marketplaceListing(listing.slug)} className={cards.link}>
        <div className={cards.media}>
          {cover && (
            <MarketImage
              id={cover.id}
              base={base}
              alt={listing.title}
              fill
              sizes="(min-width: 72rem) 400px, (min-width: 40rem) 50vw, 100vw"
              className={cards.image}
            />
          )}
          <span className={`badge badge--gold ${cards.status}`}>{listingPurposeLabels[listing.purpose]}</span>
        </div>
        <div className={cards.body}>
          <p className={cards.kicker}>{listingKindLabels[listing.kind]}</p>
          <h2 className={cards.title}>{listing.title}</h2>
          <p className={cards.location}>
            <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {listingPlace(listing)}
          </p>
          <p className={cards.meta}>
            {listing.bedrooms ? `${listing.bedrooms} BHK · ` : ''}
            {listingArea(listing)}
          </p>
          <div className={cards.footer}>
            <p className={cards.price}>
              <span className={cards.priceLabel}>Price</span>
              {listingPrice(listing)}
            </p>
            <span className={cards.arrow} aria-hidden="true">
              <ArrowUpRight strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
