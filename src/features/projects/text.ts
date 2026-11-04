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
  const cleaned = (cell ?? '').replace(/,/g, '').replace(/\s*(sq\s*ft|km)$/i, '').trim()
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

export const homes = {
  shape: 'Type | from sq ft | to sq ft',
  parse: (raw: string) =>
    table(raw, 'Homes', homes.shape, ([label, from, to]) => {
      const start = toNumber(from)
      const end = to ? toNumber(to) : undefined
      if (!label || Number.isNaN(start) || (end !== undefined && (Number.isNaN(end) || end < start))) return undefined
      return end === undefined || end === start ? { label, from: start } : { label, from: start, to: end }
    }),
  format: (items: readonly Readonly<{ label: string; from: number; to?: number }>[]) =>
    items.map((item) => [item.label, item.from, ...(item.to ? [item.to] : [])].join(' | ')).join('\n'),
}

export const facts = {
  shape: 'Label | Value',
  parse: (raw: string) => table(raw, 'Key facts', facts.shape, ([label, value, ...rest]) => (label && value && rest.length === 0 ? { label, value } : undefined)),
  format: (items: readonly Readonly<{ label: string; value: string }>[]) => items.map((item) => `${item.label} | ${item.value}`).join('\n'),
}

export const nearby = {
  shape: 'Place | km',
  parse: (raw: string) =>
    table(raw, 'Nearby places', nearby.shape, ([place, km, ...rest]) => {
      const distance = toNumber(km)
      return place && !Number.isNaN(distance) && rest.length === 0 ? { place, km: distance } : undefined
    }),
  format: (items: readonly Readonly<{ place: string; km: number }>[]) => items.map((item) => `${item.place} | ${item.km}`).join('\n'),
}

export const units = {
  shape: 'Unit | BHK | Carpet | Built-up | Super built-up',
  parse: (raw: string) =>
    table(raw, 'Unit-wise areas', units.shape, ([unit, bhk, carpet, builtUp, superBuiltUp, ...rest]) => {
      const values = [toNumber(bhk?.replace(/\s*bhk$/i, '')), toNumber(carpet), toNumber(builtUp), toNumber(superBuiltUp)]
      if (!unit || rest.length > 0 || values.some(Number.isNaN) || !Number.isInteger(values[0])) return undefined
      const [rooms, c, b, s] = values as [number, number, number, number]
      return { unit, bhk: rooms, carpet: c, builtUp: b, superBuiltUp: s }
    }),
  format: (items: readonly Readonly<{ unit: string; bhk: number; carpet: number; builtUp: number; superBuiltUp: number }>[]) =>
    items.map((u) => [u.unit, u.bhk, u.carpet.toFixed(2), u.builtUp.toFixed(2), u.superBuiltUp.toFixed(2)].join(' | ')).join('\n'),
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
