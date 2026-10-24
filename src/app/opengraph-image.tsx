import { site } from '@/config/site'
import { ogContentType, ogSize, renderOgCard } from '@/seo/og-image'

export const alt = `${site.name}: ${site.descriptor} in ${site.city}`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return renderOgCard({
    eyebrow: `${site.city} · Since day one`,
    title: 'Modern homes by trusted builders in Jaipur',
    facts: [
      { term: 'Projects', detail: 'Villas · Apartments · Plots' },
      { term: 'Construction', detail: 'Build on your plot' },
    ],
  })
}
