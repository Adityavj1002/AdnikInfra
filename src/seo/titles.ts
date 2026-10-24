import { site } from '@/config/site'

/** Roughly what Google shows before truncating a title. */
export const TITLE_MAX = 60

export type TitleInput = Readonly<{
  name: string
  /** Locality, e.g. "Jagatpura". Kept in the title wherever it fits: local intent matters most. */
  location?: string
}>

export type Titles = Readonly<{ title: string; socialTitle: string }>

function clip(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * Titles step down a ladder until they fit, so results never show a title cut mid-word:
 * "Name, Locality, Jaipur | Brand" → "Name, Locality | Brand" → "Name | Brand" → "Name…".
 * Social cards always get the fullest version.
 */
export function buildTitle({ name, location }: TitleInput): Titles {
  const brand = site.name
  const ladder = location
    ? [`${name}, ${location}, ${site.city} | ${brand}`, `${name}, ${location} | ${brand}`, `${name} | ${brand}`]
    : [`${name} | ${brand}`]
  const title = ladder.find((candidate) => candidate.length <= TITLE_MAX) ?? clip(name, TITLE_MAX)
  return { title, socialTitle: ladder[0] ?? title }
}
