import type { StaticImageData } from 'next/image'

/**
 * Content model (ARCHITECTURE.md §5). Everything is readonly: content flows down from
 * the repository as immutable data and is never mutated by components.
 */

export type Img = Readonly<{ src: StaticImageData; alt: string }>

export type Money = Readonly<{ amount: number; currency: 'INR' }>

export type GeoPoint = Readonly<{ lat: number; lng: number }>

export type Faq = Readonly<{ question: string; answer: string }>

export type FaqGroup = Readonly<{ slug: string; title: string; faqs: readonly Faq[] }>

/** A town near Jaipur that we serve: its own landing page under /locations/near-jaipur. */
export type Town = Readonly<{
  slug: string
  name: string
  corridor: string
  direction: string
  /** Approximate road distance from central Jaipur, rounded to 5 km. */
  distanceKm: number
  /** ≤ 160 chars: card text and meta description. */
  summary: string
  intro: readonly string[]
  offers: readonly string[]
  faqs: readonly Faq[]
}>

/** Agricultural land is sold by the acre; plots by the square yard; built space by the square foot. */
export type Area = Readonly<{ value: number; unit: 'sqft' | 'sqyd' | 'acre' }>

export type Locality = Readonly<{
  slug: string
  name: string
  zone: string
  /** One sentence for cards and meta descriptions (≤ 160 chars). */
  summary: string
  intro: readonly string[]
  highlights: readonly string[]
  geo: GeoPoint
  faqs: readonly Faq[]
  updatedAt: string
}>

export type ProjectType = 'villa' | 'apartment' | 'plot' | 'commercial'
export type ProjectStatus = 'ongoing' | 'upcoming' | 'completed'

export type AmenityKey =
  | 'clubhouse'
  | 'pool'
  | 'gym'
  | 'garden'
  | 'kids-play'
  | 'security'
  | 'cctv'
  | 'power-backup'
  | 'parking'
  | 'jogging-track'
  | 'rainwater'
  | 'solar'
  | 'ev-charging'
  | 'lift'
  | 'gated'
  | 'community-hall'
  | 'wifi'

export type Configuration = Readonly<{
  label: string
  /** Single size or a range. */
  area: Area | readonly [Area, Area]
  price: Money | null
}>

export type Project = Readonly<{
  slug: string
  name: string
  type: ProjectType
  status: ProjectStatus
  localitySlug: string
  tagline: string
  /** ≤ 160 chars: card text and meta description. */
  summary: string
  description: readonly string[]
  priceFrom: Money | null
  configurations: readonly Configuration[]
  possession: string
  /** Rajasthan RERA registration number. null until issued; never invented. */
  rera: string | null
  facts: readonly Readonly<{ label: string; value: string }>[]
  amenities: readonly AmenityKey[]
  specifications: readonly Readonly<{ group: string; items: readonly string[] }>[]
  nearby: readonly Readonly<{ place: string; km: number }>[]
  geo: GeoPoint
  gallery: readonly Img[]
  updates: readonly Readonly<{ date: string; text: string }>[]
  featured: boolean
  updatedAt: string
}>

export type PropertyType = 'apartment' | 'villa' | 'plot' | 'commercial' | 'agricultural'

export type Property = Readonly<{
  slug: string
  title: string
  type: PropertyType
  bhk: number | null
  area: Area
  price: Money
  localitySlug: string
  possession: 'ready' | 'under-construction'
  furnishing?: 'unfurnished' | 'semi-furnished' | 'furnished'
  floor?: string
  facing?: string
  /** ≤ 160 chars. */
  summary: string
  description: readonly string[]
  features: readonly string[]
  gallery: readonly Img[]
  listedAt: string
  updatedAt: string
}>

export type ConstructionPackage = Readonly<{
  slug: 'standard' | 'premium' | 'luxury'
  name: string
  /** Indicative ₹ per sq ft of built-up area. */
  ratePerSqft: number
  summary: string
  inclusions: readonly string[]
}>

export type PostBlock = Readonly<{ type: 'p' | 'h2'; text: string }> | Readonly<{ type: 'ul'; items: readonly string[] }>

export type Post = Readonly<{
  slug: string
  title: string
  summary: string
  published: string
  updatedAt: string
  readingMinutes: number
  cover: Img
  body: readonly PostBlock[]
}>

export type Stat = Readonly<{ value: string; label: string }>

/** A real film of a project. Optional until footage exists (§ cinematic video). */
export type Film = Readonly<{
  title: string
  description: string
  poster: string
  sources: readonly Readonly<{ src: string; type: string }>[]
  captions?: Readonly<{ src: string; srclang: string; label: string }>
  duration: string
  uploadDate: string
  transcript: readonly string[]
}>
