import { site } from '@/config/site'
import { ogContentType, ogSize, renderOgCard } from '@/seo/og-image'

export const alt = `${site.name}: infrastructure consultants in ${site.city}`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return renderOgCard({
    eyebrow: `${site.city} · Infrastructure consultants`,
    title: 'Plan. Comply. Build. Grow.',
    facts: [
      { term: 'Services', detail: 'Advisory · Clearance · Project management' },
      { term: 'Sectors', detail: 'Infrastructure · Industrial · Mining' },
    ],
  })
}
