/**
 * Input normalisation before validation (§11.2 step 4). Unicode NFKC folds look-alike
 * characters, control characters are removed, and whitespace is tidied. Newlines and tabs
 * survive only where multi-line text is expected.
 */

// C0/C1 controls except tab (09), newline (0A) and carriage return (0D).
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g
const SINGLE_LINE_BREAKS = /[\t\r\n]+/g

export function normalizeLine(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFKC')
    .replace(CONTROL_CHARS, '')
    .replace(SINGLE_LINE_BREAKS, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function normalizeMultiline(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFKC')
    .replace(CONTROL_CHARS, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Reads only the expected keys from FormData: unknown fields are ignored, never trusted. */
export function pickFields<K extends string>(form: FormData, keys: readonly K[]): Record<K, unknown> {
  return Object.fromEntries(keys.map((key) => [key, form.get(key) ?? undefined])) as Record<K, unknown>
}
