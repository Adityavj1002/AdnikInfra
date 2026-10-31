import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import blocks from '@/components/ui/blocks.module.css'
import { services } from '@/content/services'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

const description =
  'Infrastructure consulting in Jaipur: construction advisory, environmental clearance, project management, real estate consultancy and development.'
const { title } = buildTitle({ name: 'Infrastructure Consulting Services' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Services', path: routes.services },
]

export const metadata = buildMetadata({ title, description, path: routes.services })

export default function ServicesPage() {
  return (
    <>
      <JsonLd graph={graph(webPageNode({ path: routes.services, name: title, description, breadcrumb: true }), breadcrumbNode(routes.services, crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Our services"
        title="Infrastructure consulting services in Jaipur"
        lead={<p>Five services, one team from first plan to final approval.</p>}
      />
      <section className="section section--tight" aria-label="Services">
        <div className="container">
          <ul role="list" className={blocks.features}>
            {services.map((service) => (
              <li key={service.slug} className={blocks.feature}>
                <h2 className={blocks.featureTitle}>{service.title}</h2>
                <p className={blocks.featureBody}>{service.body}</p>
                <Link href={service.href} className="link-more">
                  {service.cta ?? 'Explore Service'} <ArrowUpRight aria-hidden="true" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand
        id="services-cta"
        title="Tell us about your project"
        body="Send the location, type of project and your timeline. We will reply with the approvals needed and a scope of work."
        primary={{ href: contactHref('proposal'), label: 'Request a proposal' }}
      />
    </>
  )
}
