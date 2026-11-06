/**
 * The admin project form edits lists as plain text: one item per line, cells separated by "|",
 * paragraphs and specification groups separated by a blank line. These turn that text into
 * data and back, with a line-numbered message for anything that doesn't parse.
 */

export type Parsed<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; message: string }>

const lines = (raw: string) =>
  raw
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())

const blocks = (raw: string) =>
  raw
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

const cells = (line: string) => line.split('|').map((cell) => cell.trim())

/** "1,107.75" → 1107.75; anything else → NaN. */
export function toNumber(cell: string | undefined): number {
  const cleaned = (cell ?? '').replace(/,/g, '').replace(/\s*(sq\s*ft|sq\s*yd|km)$/i, '').trim()
  const value = Number(cleaned)
  return cleaned !== '' && /^[\d.]+$/.test(cleaned) && Number.isFinite(value) ? value : Number.NaN
}

export const paragraphs = {
  parse: (raw: string): readonly string[] => blocks(raw).map((block) => block.replace(/\s*\n\s*/g, ' ')),
  format: (items: readonly string[]) => items.join('\n\n'),
}

/** Rows of "|"-separated cells, each turned into an item or rejected with its line number. */
function table<T>(raw: string, field: string, shape: string, row: (cells: readonly string[]) => T | undefined): Parsed<readonly T[]> {
  const items: T[] = []
  const all = lines(raw)
  for (const [index, line] of all.entries()) {
    if (!line) continue
    const item = row(cells(line))
    if (item === undefined) return { ok: false, message: `${field}, line ${index + 1}: please write it as ${shape}.` }
    items.push(item)
  }
  return { ok: true, value: items }
}

type Home = Readonly<{ label: string; from: number; to?: number; unit?: 'sqft' | 'sqyd' }>

const isSqyd = (cell: string | undefined) => /sq\s*yd$/i.test(cell ?? '')

/** Sizes are in sq ft unless written "sq yd" (plots and villas are sold by the square yard). */
export const homes = {
  shape: 'Type | from sq ft | to sq ft',
  parse: (raw: string) =>
    table(raw, 'Homes', homes.shape, ([label, from, to]): Home | undefined => {
      const start = toNumber(from)
      const end = to ? toNumber(to) : undefined
      if (!label || Number.isNaN(start) || (end !== undefined && (Number.isNaN(end) || end < start))) return undefined
      const unit = isSqyd(from) || isSqyd(to) ? { unit: 'sqyd' as const } : {}
      return end === undefined || end === start ? { label, from: start, ...unit } : { label, from: start, to: end, ...unit }
    }),
  format: (items: readonly Home[]) =>
    items
      .map((item) => {
        const size = (value: number) => (item.unit === 'sqyd' ? `${value} sq yd` : `${value}`)
        return [item.label, size(item.from), ...(item.to ? [size(item.to)] : [])].join(' | ')
      })
      .join('\n'),
}

export const facts = {
  shape: 'Label | Value',
  parse: (raw: string) => table(raw, 'Key facts', facts.shape, ([label, value, ...rest]) => (label && value && rest.length === 0 ? { label, value } : undefined)),
  format: (items: readonly Readonly<{ label: string; value: string }>[]) => items.map((item) => `${item.label} | ${item.value}`).join('\n'),
}

/** The distance is optional: a landmark without a known distance is listed on its own. */
export const nearby = {
  shape: 'Place | km',
  parse: (raw: string) =>
    table(raw, 'Nearby places', nearby.shape, ([place, km, ...rest]) => {
      if (!place || rest.length > 0) return undefined
      if (!km) return { place }
      const distance = toNumber(km)
      return Number.isNaN(distance) ? undefined : { place, km: distance }
    }),
  format: (items: readonly Readonly<{ place: string; km?: number }>[]) =>
    items.map((item) => (item.km === undefined ? item.place : `${item.place} | ${item.km}`)).join('\n'),
}

/** A carpet area the plan doesn't publish is written "-". */
export const units = {
  shape: 'Unit | BHK | Carpet (or -) | Built-up | Super built-up',
  parse: (raw: string) =>
    table(raw, 'Unit-wise areas', units.shape, ([unit, bhk, carpet, builtUp, superBuiltUp, ...rest]) => {
      const noCarpet = carpet === '-' || carpet === ''
      const values = [toNumber(bhk?.replace(/\s*bhk$/i, '')), noCarpet ? 0 : toNumber(carpet), toNumber(builtUp), toNumber(superBuiltUp)]
      if (!unit || rest.length > 0 || values.some(Number.isNaN) || !Number.isInteger(values[0])) return undefined
      const [rooms, c, b, s] = values as [number, number, number, number]
      return noCarpet ? { unit, bhk: rooms, builtUp: b, superBuiltUp: s } : { unit, bhk: rooms, carpet: c, builtUp: b, superBuiltUp: s }
    }),
  format: (items: readonly Readonly<{ unit: string; bhk: number; carpet?: number; builtUp: number; superBuiltUp: number }>[]) =>
    items.map((u) => [u.unit, u.bhk, u.carpet === undefined ? '-' : u.carpet.toFixed(2), u.builtUp.toFixed(2), u.superBuiltUp.toFixed(2)].join(' | ')).join('\n'),
}

/** A heading line, then its points (a leading "-" or "•" is optional); groups split by a blank line. */
export const specifications = {
  parse: (raw: string): Parsed<readonly Readonly<{ group: string; items: readonly string[] }>[]> => {
    const groups: { group: string; items: string[] }[] = []
    for (const block of blocks(raw)) {
      const [group, ...items] = lines(block).map((line) => line.replace(/^[-•*]\s*/, '')).filter(Boolean)
      if (!group || items.length === 0) {
        return { ok: false, message: `Specifications: "${group ?? ''}" needs at least one point below its heading.` }
      }
      groups.push({ group, items })
    }
    return { ok: true, value: groups }
  },
  format: (items: readonly Readonly<{ group: string; items: readonly string[] }>[]) =>
    items.map((spec) => [spec.group, ...spec.items.map((item) => `- ${item}`)].join('\n')).join('\n\n'),
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Construction progress: "2026-11-04 | What happened", newest or oldest first (the page sorts). */
export const updates = {
  shape: 'YYYY-MM-DD | What happened',
  parse: (raw: string) =>
    table(raw, 'Progress', updates.shape, ([date, text, ...rest]) =>
      date && ISO_DATE.test(date) && !Number.isNaN(Date.parse(date)) && text && rest.length === 0 ? { date, text } : undefined,
    ),
  format: (items: readonly Readonly<{ date: string; text: string }>[]) => items.map((item) => `${item.date} | ${item.text}`).join('\n'),
}

/** One line per point; blank lines are dropped. */
export const bullets = {
  parse: (raw: string): readonly string[] => lines(raw).filter(Boolean),
  format: (items: readonly string[]) => items.join('\n'),
}
