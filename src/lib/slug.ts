const SLUG_CHARS = /^[a-z0-9-]{1,80}$/

/** Lowercase words joined by single hyphens, at most 80 characters (no nested quantifiers: ReDoS-safe). */
export function isSlug(value: string): boolean {
  return SLUG_CHARS.test(value) && !value.startsWith('-') && !value.endsWith('-') && !value.includes('--')
}
