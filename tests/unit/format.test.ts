import { describe, expect, it } from 'vitest'
import { estimateCost, estimateMonths } from '@/features/calculators/CostEstimator'
import { monthlyEmi } from '@/features/calculators/EmiCalculator'
import { formatArea, formatAreaRange, formatDate, formatPrice, formatPriceFull } from '@/lib/format'

describe('Indian price formatting', () => {
  it.each([
    [14_500_000, '₹1.45 Cr'],
    [20_500_000, '₹2.05 Cr'],
    [6_800_000, '₹68 L'],
    [3_850_000, '₹38.5 L'],
    [99_000, '₹99,000'],
  ])('%d → %s', (amount, expected) => {
    expect(formatPrice({ amount, currency: 'INR' })).toBe(expected)
  })

  it('says "Price on request" instead of inventing a number', () => {
    expect(formatPrice(null)).toBe('Price on request')
  })

  it('groups full prices in lakh/crore style', () => {
    expect(formatPriceFull({ amount: 14_500_000, currency: 'INR' })).toBe('₹1,45,00,000')
  })
})

describe('areas and dates', () => {
  it('shows sq ft, and converts sq yd plots to sq ft too', () => {
    expect(formatArea({ value: 1850, unit: 'sqft' })).toBe('1,850 sq ft')
    expect(formatArea({ value: 200, unit: 'sqyd' })).toBe('200 sq yd (1,800 sq ft)')
  })

  it('formats size ranges', () => {
    expect(formatAreaRange([{ value: 150, unit: 'sqyd' }, { value: 300, unit: 'sqyd' }])).toBe('150–300 sq yd')
  })

  it('formats dates the same on server and client (UTC)', () => {
    expect(formatDate('2027-12-01')).toBe('1 Dec 2027')
  })
})

describe('EMI calculator', () => {
  it('matches the standard reducing-balance formula', () => {
    // ₹50 L at 8.5% for 20 years ≈ ₹43,391 a month.
    expect(Math.round(monthlyEmi(5_000_000, 8.5, 20))).toBe(43391)
  })

  it('handles zero interest and empty input safely', () => {
    expect(monthlyEmi(1_200_000, 0, 10)).toBe(10_000)
    expect(monthlyEmi(0, 8.5, 20)).toBe(0)
    expect(monthlyEmi(1_000_000, 8.5, 0)).toBe(0)
  })
})

describe('construction estimator', () => {
  it('multiplies built-up area by the package rate', () => {
    expect(estimateCost(3000, 1950)).toBe(5_850_000)
    expect(estimateCost(-10, 1950)).toBe(0)
  })

  it('gives longer schedules for more floors', () => {
    expect(estimateMonths(1)).toEqual([8, 12])
    expect(estimateMonths(3)[1]).toBeGreaterThan(estimateMonths(2)[1])
  })
})
