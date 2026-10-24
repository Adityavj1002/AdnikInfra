import { getLocality, getProject, isValidSlug } from '@/content/repository'
import { formatPrice, projectStatusLabel } from '@/lib/format'
import { ogContentType, ogSize, renderOgCard } from '@/seo/og-image'

export const alt = 'Adnik Infra project'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const project = isValidSlug(slug) ? await getProject(slug) : undefined
  if (!project) return renderOgCard({ eyebrow: 'Projects', title: 'New residential projects in Jaipur' })
  const locality = await getLocality(project.localitySlug)

  return renderOgCard({
    eyebrow: `${locality?.name ?? ''}, Jaipur · ${projectStatusLabel[project.status]}`,
    title: project.name,
    facts: [
      { term: 'Homes', detail: project.configurations.map((c) => c.label).slice(0, 2).join(' · ') },
      { term: project.priceFrom ? 'From' : 'Price', detail: formatPrice(project.priceFrom) },
      { term: 'Possession', detail: project.possession },
    ],
  })
}
