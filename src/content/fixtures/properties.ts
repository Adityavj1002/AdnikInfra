import type { Property } from '../types'

// No resale listings are published from code: the sample ones were fictional. Real listings come
// through the marketplace (admin-approved), and /properties redirects there (next.config.ts).
export const properties: readonly Property[] = []
