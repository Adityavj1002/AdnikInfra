import 'server-only'
import { unstable_cache } from 'next/cache'
import { CACHE_SECONDS, cacheTags } from '@/lib/cache-tags'
import { getStore } from '@/store/runtime'
import type { ListingFilters } from './types'

const options = { tags: [cacheTags.listings], revalidate: CACHE_SECONDS }

/** Approved listings for the public pages and the sitemap, cached until an admin decides on one. */
export const approvedListings = unstable_cache(
  async (filters: ListingFilters, limit: number, offset: number) => (await getStore()).listListings({ status: 'approved', filters, limit, offset }),
  ['approved-listings'],
  options,
)

export const listingBySlug = unstable_cache(async (slug: string) => (await getStore()).getListingBySlug(slug) ?? null, ['listing-by-slug'], options)
