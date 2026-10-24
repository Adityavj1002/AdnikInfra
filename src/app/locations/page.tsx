import { ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { photos } from '@/content/images'
import { getLocalities, getProjects, getProperties } from '@/content/repository'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, localityNode, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './locations.module.css'

const description =
  'The best areas to buy property in Jaipur: Vaishali Nagar, Jagatpura, Mansarovar, Ajmer Road, Tonk Road and Malviya Nagar, with projects and homes in each.'
const { title } = buildTitle({ name: 'Best Areas to Buy Property in Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Locations', path: routes.locations },
]

export const metadata = buildMetadata({ title, description, path: routes.locations })

export default async function LocationsPage() {
  const [localities, projects, properties] = await Promise.all([getLocalities(), getProjects(), getProperties()])

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.locations, name: title, description, type: 'CollectionPage', breadcrumb: true }),
          breadcrumbNode(routes.locations, crumbs),
          ...localities.map(localityNode),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        image={photos.jaipurAerial}
        eyebrow="Locations"
        title="Best areas to buy property in Jaipur"
        lead={<p>Where we build and sell, and what each neighbourhood is like to live in.</p>}
      />
      <section className="section" aria-label="Localities">
        <ul role="list" className={`container grid-cards ${styles.list}`}>
          {localities.map((locality) => {
            const projectCount = projects.filter((p) => p.localitySlug === locality.slug).length
            const propertyCount = properties.filter((p) => p.localitySlug === locality.slug).length
            return (
              <li key={locality.slug}>
                <Link href={routes.location(locality.slug)} className={styles.card}>
                  <span className={styles.zone}>
                    <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {locality.zone}
                  </span>
                  <h2 className={styles.name}>{locality.name}</h2>
                  <p className={styles.summary}>{locality.summary}</p>
                  <span className={styles.meta}>
                    {projectCount} {projectCount === 1 ? 'project' : 'projects'} · {propertyCount}{' '}
                    {propertyCount === 1 ? 'real estate listing' : 'real estate listings'}
                  </span>
                  <span className="link-more">
                    Explore {locality.name} <ArrowRight aria-hidden="true" strokeWidth={1.75} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
      <CtaBand
        id="locations-cta"
        title="Not sure which area suits you?"
        body="Tell us your budget, commute and family needs. We’ll suggest areas and arrange visits in a single day."
        primary={{ href: contactHref('buy'), label: 'Get area advice' }}
      />
    </>
  )
}
