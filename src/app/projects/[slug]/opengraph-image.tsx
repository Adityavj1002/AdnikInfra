import { getLocality, getProject } from '@/content/repository'
import { isSlug } from '@/lib/slug'
import { formatAreaRange, projectStage } from '@/lib/format'
import { ogContentType, ogSize, renderOgCard } from '@/seo/og-image'

export const alt = 'Adnik Infra project'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const project = isSlug(slug) ? await getProject(slug) : undefined
  if (!project) return renderOgCard({ eyebrow: 'Projects', title: 'New residential projects in Jaipur' })
  const locality = await getLocality(project.localitySlug)

  return renderOgCard({
    eyebrow: `${locality?.name ?? ''}, Jaipur · ${projectStage(project)}`,
    title: project.name,
    facts: [
      { term: 'Homes', detail: project.configurations.map((c) => c.label).slice(0, 2).join(' · ') },
      ...(project.configurations[0] ? [{ term: 'Sizes', detail: formatAreaRange(project.configurations[0].area) }] : []),
      { term: 'Possession', detail: project.possession },
    ],
  })
}
