import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { sectorPages } from '@/content/consultancy'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, consultancyServiceNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

type Params = Readonly<{ params: Promise<{ slug: string }> }>

export function generateStaticParams() {
  return sectorPages.map(({ slug }) => ({ slug }))
}

const find = async ({ params }: Params) => {
  const { slug } = await params
  return sectorPages.find((page) => page.slug === slug)
}

export async function generateMetadata(props: Params) {
  const page = await find(props)
  if (!page) return {}
  return buildMetadata({ title: buildTitle({ name: page.metaTitle }).title, description: page.metaDescription, path: routes.sector(page.slug) })
}

export default async function SectorPage(props: Params) {
  const page = await find(props)
  if (!page) notFound()
  const path = routes.sector(page.slug)
  const crumbs: readonly Crumb[] = [
    { name: 'Home', path: routes.home },
    { name: page.title, path },
  ]
  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path, name: page.metaTitle, description: page.metaDescription, breadcrumb: true }),
          breadcrumbNode(path, crumbs),
          consultancyServiceNode({ path, name: `${page.title} consulting`, description: page.metaDescription, serviceType: 'Infrastructure consulting' }),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero eyebrow="Sectors we serve" title={page.heading} lead={<p>{page.lead}</p>} />
      <section className="section section--tight" aria-labelledby="work-title">
        <div className="container stack">
          <SectionHeading id="work-title" title={`${page.title} work we support`} intro={<p>{page.scope}</p>} />
          <ul role="list" className={blocks.features}>
            {page.needs.map((item) => (
              <li key={item.title} className={blocks.feature}>
                <h3 className={blocks.featureTitle}>{item.title}</h3>
                <p className={blocks.featureBody}>{item.body}</p>
              </li>
            ))}
          </ul>
          <Link href={`${routes.environmentalClearance}#${page.clearanceAnchor}`} className="link-more">
            See all clearance services <ArrowRight aria-hidden="true" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
      <CtaBand
        id="sector-cta"
        title="Tell us about your project"
        body="Send the location, type of project and your timeline. We will reply with the approvals needed and a scope of work."
        primary={{ href: contactHref('proposal'), label: 'Request a proposal' }}
      />
    </>
  )
}
