/**
 * Tags on cached database reads. Public pages read through a short cache instead of hitting the
 * database on every visit; the admin action that changes the data expires its tag at once.
 */
export const cacheTags = {
  projects: 'projects',
  featured: 'featured',
  listings: 'listings',
} as const

/** Fallback freshness for other server instances, which an admin's action can't reach directly. */
export const CACHE_SECONDS = 300
