const SLUG_CHARS = /^[a-z0-9-]{1,80}$/

/** Lowercase words joined by single hyphens, at most 80 characters (no nested quantifiers: ReDoS-safe). */
export function isSlug(value: string): boolean {
  return SLUG_CHARS.test(value) && !value.startsWith('-') && !value.endsWith('-') && !value.includes('--')
}

/** A web address from a name: "Liv Gyan, Jagatpura" → "liv-gyan-jagatpura". */
export function toSlug(name: string): string {
  const words = name
    .toLowerCase()
    .normalize('NFKD')
    .split(/[^a-z0-9]/)
    .filter(Boolean)
  let slug = ''
  for (const word of words) {
    if ((slug ? slug.length + 1 : 0) + word.length > 80) break
    slug = slug ? `${slug}-${word}` : word
  }
  return slug
}
