import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import localFont from 'next/font/local'

// Self-hosted at build time: no runtime request to Google, so font-src stays 'self'.
export const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-display-face',
})

export const text = Inter({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-text-face',
})

/*
 * ₹ (U+20B9) is outside Google's "latin" subset, so every price would otherwise pull in the
 * whole latin-ext file of both families (~107 KB) for one glyph. These 1 KB subsets carry only
 * the rupee sign, with the full weight axis, and sit first in the font stacks (tokens.css).
 * Rebuild with: pyftsubset <latin-ext.woff2> --unicodes=U+20B9 --flavor=woff2 --layout-features='*'
 * (next/font options must be literals, hence the repeated declaration.)
 */
export const displayRupee = localFont({
  src: '../assets/fonts/PlusJakartaSans-Rupee.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-display-rupee',
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+20B9' }],
})

export const textRupee = localFont({
  src: '../assets/fonts/Inter-Rupee.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-text-rupee',
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+20B9' }],
})
