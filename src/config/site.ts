/**
 * Brand and business constants. Changing a value here updates titles, metadata, JSON-LD,
 * header, footer and contact actions everywhere.
 *
 * Contact and business details are deliberately empty until the real ones are supplied:
 * the site must never show or claim a phone number, address or RERA number we don't have.
 * Filling them in turns on the Call / WhatsApp buttons and local-SEO structured data
 * (ARCHITECTURE.md §8).
 */

export type PostalAddress = Readonly<{
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}>

export type SiteConfig = Readonly<{
  name: string
  descriptor: string
  city: string
  state: string
  /** Default meta description: 50–160 characters (unit-tested). */
  description: string
  language: string
  locale: string
  ogLocale: string
  contact: Readonly<{
    email?: string
    /** E.164, e.g. +9198XXXXXXXX */
    phone?: string
    /** E.164 number for wa.me links */
    whatsapp?: string
    hours: string
    responseTime: string
  }>
  business: Readonly<{
    address?: PostalAddress
    geo?: Readonly<{ lat: number; lng: number }>
    openingHours?: readonly string[]
    /** Google Business Profile, Instagram, Facebook, YouTube… (schema.org sameAs) */
    profiles: readonly string[]
    /** Company-level RERA agent registration, if any. */
    reraAgent?: string
  }>
}>

export const site: SiteConfig = {
  name: 'Adnik Infra',
  descriptor: 'Builders & Real Estate Developers',
  city: 'Jaipur',
  state: 'Rajasthan',
  description:
    'Adnik Infra: trusted builders in Jaipur for modern villas, apartments and plots — plus home construction on your own plot, from design to handover.',
  language: 'en',
  locale: 'en-IN',
  ogLocale: 'en_IN',
  contact: {
    hours: 'Mon–Sat, 10 am – 7 pm',
    responseTime: 'We reply within one working day.',
  },
  business: {
    profiles: [],
  },
}
