import { getLocality, getProperty, isValidSlug } from '@/content/repository'
import { formatArea, formatPrice, possessionText } from '@/lib/format'
import { ogContentType, ogSize, renderOgCard } from '@/seo/og-image'

export const alt = 'Property for sale in Jaipur'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const property = isValidSlug(slug) ? await getProperty(slug) : undefined
  if (!property) return renderOgCard({ eyebrow: 'Properties', title: 'Property for sale in Jaipur' })
  const locality = await getLocality(property.localitySlug)

  return renderOgCard({
    eyebrow: `For sale · ${locality?.name ?? ''}, Jaipur`,
    title: property.title,
    facts: [
      { term: 'Price', detail: formatPrice(property.price) },
      { term: 'Area', detail: formatArea(property.area) },
      { term: 'Status', detail: possessionText(property.type, property.possession) },
    ],
  })
}
