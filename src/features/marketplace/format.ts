import { formatPrice } from '@/lib/format'
import { areaUnitLabels, listingKindLabels, listingPurposeLabels } from './constants'
import type { Listing, PublicListing } from './types'

/** Client-safe display helpers shared by pages, cards, admin screens and emails. */

const grouped = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export function listingPrice(listing: Pick<Listing, 'priceInr' | 'purpose'>): string {
  const price = formatPrice({ amount: listing.priceInr, currency: 'INR' })
  return listing.purpose === 'rent' ? `${price} / month` : price
}

export function listingArea(listing: Pick<Listing, 'areaValue' | 'areaUnit'>): string {
  return `${grouped.format(listing.areaValue)} ${areaUnitLabels[listing.areaUnit]}`
}

export function listingPlace(listing: Pick<Listing, 'locality' | 'city'>): string {
  return `${listing.locality}, ${listing.city}`
}

export function listingSummary(listing: PublicListing): string {
  return [
    listingKindLabels[listing.kind],
    listingPurposeLabels[listing.purpose].toLowerCase(),
    listing.bedrooms ? `${listing.bedrooms} BHK` : undefined,
    listingArea(listing),
  ]
    .filter(Boolean)
    .join(' · ')
}
