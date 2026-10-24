import { ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { site } from '@/config/site'
import { getTowns } from '@/content/repository'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, townNodes, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from '../locations.module.css'

const description =
  'Property and construction near Jaipur: plots, agricultural land and homes in Chaksu, Niwai, Tonk, Phagi, Malpura, Bagru, Chomu, Bassi and more.'
const { title } = buildTitle({ name: 'Property & Construction near Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Locations', path: routes.locations },
  { name: 'Near Jaipur', path: routes.nearJaipur },
]

export const metadata = buildMetadata({ title, description, path: routes.nearJaipur })

export default async function NearJaipurPage() {
  const towns = await getTowns()
  // Group the towns by the road you take out of Jaipur to reach them.
  const corridors = site.serviceArea.corridors
    .map((corridor) => ({ corridor, towns: towns.filter((town) => town.corridor === corridor) }))
    .filter((group) => group.towns.length > 0)

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.nearJaipur, name: title, description, type: 'CollectionPage', breadcrumb: true }),
          breadcrumbNode(routes.nearJaipur, crumbs),
          ...towns.flatMap((town) => townNodes(town).slice(0, 1)),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Jaipur & nearby"
        title="Property and construction near Jaipur"
        lead={
          <p>
            We don’t stop at the city limits. Along Tonk Road, Ajmer Road, the Diggi road and the other highways, we sell
            plots and agricultural land and build homes in the towns around Jaipur.
          </p>
        }
      />

      {corridors.map(({ corridor, towns: group }) => (
        <section key={corridor} className="section section--tight" aria-labelledby={`corridor-${corridor}`}>
          <div className="container">
            <h2 id={`corridor-${corridor}`} className={styles.corridorTitle}>
              Along {corridor}
            </h2>
            <ul role="list" className={`grid-cards ${styles.list}`}>
              {group.map((town) => (
                <li key={town.slug}>
                  <Link href={routes.town(town.slug)} className={styles.card}>
                    <span className={styles.zone}>
                      <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> About {town.distanceKm} km{' '}
                      {town.direction} of {site.city}
                    </span>
                    <h3 className={styles.name}>{town.name}</h3>
                    <p className={styles.summary}>{town.summary}</p>
                    <span className="link-more">
                      Property in {town.name} <ArrowRight aria-hidden="true" strokeWidth={1.75} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <CtaBand
        id="near-cta"
        title="Your town isn’t listed?"
        body="We work across the Jaipur region. Tell us where your plot or land is, and we’ll tell you how we can help."
        primary={{ href: contactHref('other'), label: 'Ask about your area' }}
        secondary={{ href: routes.locations, label: 'Areas inside Jaipur' }}
      />
    </>
  )
}
