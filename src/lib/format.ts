import type { Area, Configuration, Money, ProjectStatus, ProjectType, PropertyType } from '@/content/types'

const LOCALE = 'en-IN'
const SQFT_PER_SQYD = 9
const SQYD_PER_ACRE = 4_840

const grouped = new Intl.NumberFormat(LOCALE)
const dateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function trimDecimals(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.?0+$/, '')
}

/** Indian-style short price: ₹1.45 Cr, ₹68 L. */
export function formatPrice(money: Money | null): string {
  if (!money) return 'Price on request'
  const { amount } = money
  if (amount >= 10_000_000) return `₹${trimDecimals(amount / 10_000_000, 2)} Cr`
  if (amount >= 100_000) return `₹${trimDecimals(amount / 100_000, 2)} L`
  return `₹${grouped.format(amount)}`
}

/** Full grouped price with lakh/crore separators: ₹1,45,00,000. */
export function formatPriceFull(money: Money): string {
  return `₹${grouped.format(money.amount)}`
}

export function formatRupees(amount: number): string {
  return `₹${grouped.format(Math.round(amount))}`
}

export const areaUnitLabel: Readonly<Record<Area['unit'], string>> = { sqft: 'sq ft', sqyd: 'sq yd', acre: 'acres' }

export function formatArea(area: Area): string {
  if (area.unit === 'sqyd') {
    return `${grouped.format(area.value)} sq yd (${grouped.format(area.value * SQFT_PER_SQYD)} sq ft)`
  }
  if (area.unit === 'acre') {
    const acres = `${trimDecimals(area.value, 2)} ${area.value === 1 ? 'acre' : 'acres'}`
    return `${acres} (${grouped.format(Math.round(area.value * SQYD_PER_ACRE))} sq yd)`
  }
  return `${grouped.format(area.value)} sq ft`
}

export function formatAreaRange(area: Configuration['area']): string {
  if (!Array.isArray(area)) return formatArea(area as Area)
  const [min, max] = area as readonly [Area, Area]
  const unit = areaUnitLabel[min.unit]
  return `${grouped.format(min.value)}–${grouped.format(max.value)} ${unit}`
}

/** Dates are stored as ISO yyyy-mm-dd and formatted in UTC so server and client agree. */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`))
}

export const projectStatusLabel: Readonly<Record<ProjectStatus, string>> = {
  ongoing: 'Under construction',
  upcoming: 'Upcoming',
  completed: 'Completed',
}

export const projectTypeLabel: Readonly<Record<ProjectType, string>> = {
  villa: 'Villas',
  apartment: 'Apartments',
  plot: 'Plots',
  commercial: 'Commercial',
}

export const propertyTypeLabel: Readonly<Record<PropertyType, string>> = {
  apartment: 'Apartment',
  villa: 'Villa',
  plot: 'Plot',
  commercial: 'Commercial',
  agricultural: 'Agricultural land',
}

export const possessionLabel = { ready: 'Ready to move', 'under-construction': 'Under construction' } as const

export const furnishingLabel = {
  unfurnished: 'Unfurnished',
  'semi-furnished': 'Semi-furnished',
  furnished: 'Furnished',
} as const
