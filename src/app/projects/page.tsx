import Link from 'next/link'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { ProjectCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import blocks from '@/components/ui/blocks.module.css'
import { getLocalities, getProjects } from '@/content/repository'
import type { ProjectStatus, ProjectType } from '@/content/types'
import { projectStatusLabel, projectTypeLabel } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './projects.module.css'

const STATUSES = ['ongoing', 'upcoming', 'completed'] as const satisfies readonly ProjectStatus[]
const TYPES = ['villa', 'apartment', 'plot', 'commercial'] as const satisfies readonly ProjectType[]

// Unknown or malformed filters are dropped, never echoed or trusted.
const filterSchema = z.object({
  status: z.enum(STATUSES).optional().catch(undefined),
  type: z.enum(TYPES).optional().catch(undefined),
})

const description =
  'New residential projects in Jaipur by Adnik Infra: gated villa communities, apartments, plots and commercial spaces, with prices, plans and possession dates.'
const { title } = buildTitle({ name: 'New Residential Projects in Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Projects', path: routes.projects },
]

type PageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>

function parse(raw: Record<string, string | string[] | undefined>) {
  return filterSchema.parse({
    status: typeof raw.status === 'string' ? raw.status : undefined,
    type: typeof raw.type === 'string' ? raw.type : undefined,
  })
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { status, type } = parse(await searchParams)
  // Filtered views are crawlable but not indexed; the canonical is always the full list.
  return buildMetadata({ title, description, path: routes.projects, noindex: Boolean(status || type) })
}

function href(status?: string, type?: string): string {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (type) params.set('type', type)
  const query = params.toString()
  return query ? `${routes.projects}?${query}` : routes.projects
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { status, type } = parse(await searchParams)
  const [projects, localities] = await Promise.all([getProjects({ status, type }), getLocalities()])

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.projects, name: title, description, type: 'CollectionPage', breadcrumb: true }),
          breadcrumbNode(routes.projects, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Our projects"
        title="New residential projects in Jaipur"
        lead={<p>Villas, apartments, plots and commercial spaces we design, build and sell ourselves.</p>}
      />

      <section className="container" aria-labelledby="filter-title">
        <h2 id="filter-title" className="visually-hidden">
          Filter projects
        </h2>
        <div className={styles.filters}>
          <nav aria-label="Project status">
            <ul role="list" className={styles.tabs}>
              <li>
                <Link href={href(undefined, type)} className={styles.tab} aria-current={!status ? 'page' : undefined}>
                  All
                </Link>
              </li>
              {STATUSES.map((s) => (
                <li key={s}>
                  <Link href={href(s, type)} className={styles.tab} aria-current={status === s ? 'page' : undefined}>
                    {projectStatusLabel[s]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul role="list" className="chips" aria-label="Project type">
            {TYPES.map((t) => (
              <li key={t}>
                <Link href={href(status, type === t ? undefined : t)} className="chip" aria-current={type === t ? 'true' : undefined}>
                  {projectTypeLabel[t]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.count} aria-live="polite">
          Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </p>
      </section>

      <section className="section section--tight" aria-label="Projects">
        <div className="container">
          {projects.length > 0 ? (
            <div className="grid-cards">
              {projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  item={project}
                  headingLevel="h2"
                  locality={localities.find((l) => l.slug === project.localitySlug)}
                />
              ))}
            </div>
          ) : (
            <div className={blocks.empty}>
              <h2>No projects match those filters yet</h2>
              <p>New launches are added regularly. Tell us what you’re looking for and we’ll call you first.</p>
              <div className={styles.emptyActions}>
                <Link href={routes.projects} className="button button--outline">
                  Show all projects
                </Link>
                <Link href={contactHref('buy')} className="button">
                  Tell us what you need
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        id="projects-cta"
        title="Have a plot? We’ll build on it"
        body="Our construction team designs and builds modern homes on customers’ own plots across Jaipur."
        primary={{ href: contactHref('construction'), label: 'Get a construction quote' }}
        secondary={{ href: routes.construction, label: 'How it works' }}
      />
    </>
  )
}
