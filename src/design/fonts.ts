import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

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
