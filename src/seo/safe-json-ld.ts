const ESCAPES: Readonly<Record<string, string>> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

// U+2028/U+2029 are valid in JSON but are line terminators in older JS parsers.
const UNSAFE = /[<>&\u2028\u2029]/g

/**
 * Serialises structured data for a <script type="application/ld+json"> block. Escaping
 * `<` means no string value can ever close the script element (`</script>`), so even a
 * hostile CMS field cannot break out into HTML. The output is still valid JSON.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE, (char) => ESCAPES[char] ?? char)
}
