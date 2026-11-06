import 'server-only'
import { unstable_cache } from 'next/cache'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import { CACHE_SECONDS, cacheTags } from '@/lib/cache-tags'

/** Stored when an admin chooses to feature no project: the home page then shows no spotlight. */
export const NO_FEATURED = 'none'

const readFeatured = unstable_cache(async () => (await (await getStore()).getFeaturedProject()) ?? null, ['featured-project'], {
  tags: [cacheTags.featured],
  revalidate: CACHE_SECONDS,
})

/**
 * The project an admin chose for the home-page spotlight. A database problem must not take the
 * home page down, so any failure falls back to the first project.
 */
export async function featuredProjectSlug(): Promise<string | undefined> {
  if (!marketplaceEnabled) return undefined
  try {
    return (await readFeatured()) ?? undefined
  } catch (error) {
    console.error(`[featured] read failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return undefined
  }
}
