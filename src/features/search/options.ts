import type { PropertyType } from '@/content/types'

export const PROPERTY_TYPES: readonly Readonly<{ value: PropertyType; label: string }>[] = [
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'villa', label: 'Villa / House' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural land' },
]

/** Budget buckets: the value is the upper bound in rupees. */
export const BUDGETS: readonly Readonly<{ value: string; label: string; max: number }>[] = [
  { value: '50l', label: 'Up to ₹50 L', max: 5_000_000 },
  { value: '1cr', label: 'Up to ₹1 Cr', max: 10_000_000 },
  { value: '2cr', label: 'Up to ₹2 Cr', max: 20_000_000 },
  { value: '5cr', label: 'Up to ₹5 Cr', max: 50_000_000 },
]
