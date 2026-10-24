import { ArrowRight, CircleCheck, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PropertyCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { site } from '@/config/site'
import { getLocalities, getProperties, getTown, getTowns, isValidSlug } from '@/content/repository'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, faqNode, graph, ids, townNodes, webPageNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from '../../locations.module.css'

type PageProps = Readonly<{ params: Promise<{ town: string }> }>

export async function generateStaticParams() {
  return (await getTowns()).map((town) => ({ town: town.slug }))
}

async function load(slug: string) {
  return isValidSlug(slug) ? getTown(slug) : undefined
}

const titleFor = (name: string) => buildTitle({ name: `Property & Construction in ${name}, near Jaipur` })

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const town = await load((await params).town)
  if (!town) return {}
  return buildMetadata({ ...titleFor(town.name), description: town.summary, path: routes.town(town.slug) })
}

/** A Maps search by name: no coordinates to get wrong, and no third-party embed. */
const mapsSearch = (name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${site.state}`)}`

export default async function TownPage({ params }: PageProps) {
  const town = await load((await params).town)
  if (!town) notFound()

  const [towns, localities] = await Promise.all([getTowns(), getLocalities()])
  // Listings on the same highway corridor, when that corridor is one of our Jaipur localities.
  const corridor = localities.find((locality) => locality.name === town.corridor)
  const properties = corridor ? await getProperties({ locality: corridor.slug }) : []
  const path = routes.town(town.slug)
  const { title } = titleFor(town.name)
  const crumbs = [
    { name: 'Home', path: routes.home },
    { name: 'Locations', path: routes.locations },
    { name: 'Near Jaipur', path: routes.nearJaipur },
    { name: town.name, path },
  ] as const

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path, name: title, description: town.summary, breadcrumb: true, about: ids.town(town.slug) }),
          breadcrumbNode(path, crumbs),
          ...townNodes(town),
          faqNode(path, town.faqs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow={`${town.corridor} · about ${town.distanceKm} km ${town.direction} of ${site.city}`}
        title={`Property and construction in ${town.name}, near Jaipur`}
        lead={<p>{town.summary}</p>}
      >
        <Link href={contactHref('site-visit', town.name)} className="button button--gold">
          Plan a visit in {town.name}
        </Link>
        <Link href={contactHref('construction', town.name)} className="button button--outline">
          Build on your plot
        </Link>
        <a href={mapsSearch(town.name)} target="_blank" rel="noopener noreferrer" className="button button--outline">
          View on map <ExternalLink aria-hidden="true" strokeWidth={1.75} />
        </a>
      </PageHero>

      <section className="section section--tight" aria-labelledby="about-title">
        <div className={`container ${styles.intro}`}>
          <h2 id="about-title" className={blocks.blockTitle}>
            Real estate in {town.name}
          </h2>
          {town.intro.map((paragraph) => (
            <p key={paragraph} className={blocks.lead}>
              {paragraph}
            </p>
          ))}
          <h3 className={styles.offersTitle}>What we do in {town.name}</h3>
          <ul role="list" className={styles.highlights}>
            {town.offers.map((offer) => (
              <li key={offer}>
                <CircleCheck aria-hidden="true" className="icon" strokeWidth={1.75} />
                {offer}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {properties.length > 0 && corridor && (
        <section className="section section--raised" aria-labelledby="properties-title">
          <div className="container">
            <SectionHeading
              id="properties-title"
              eyebrow="For sale nearby"
              title={`Property on ${town.corridor}`}
              action={
                <Link href={`${routes.properties}?locality=${corridor.slug}`} className="link-more">
                  All {town.corridor} listings <ArrowRight aria-hidden="true" strokeWidth={1.75} />
                </Link>
              }
            />
            <div className="grid-cards">
              {properties.slice(0, 3).map((property) => (
                <PropertyCard key={property.slug} item={property} locality={corridor} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="faq-title">
        <div className="container">
          <SectionHeading id="faq-title" eyebrow="Questions" title={`Buying and building in ${town.name}`} />
          <FaqList faqs={town.faqs} />
        </div>
      </section>

      <section className="section section--tight section--ivory" aria-labelledby="nearby-title">
        <div className="container">
          <h2 id="nearby-title" className={blocks.blockTitle}>
            Other towns near Jaipur
          </h2>
          <ul role="list" className="chips">
            {towns
              .filter((other) => other.slug !== town.slug)
              .map((other) => (
                <li key={other.slug}>
                  <Link href={routes.town(other.slug)} className="chip">
                    {other.name}
                  </Link>
                </li>
              ))}
            <li>
              <Link href={routes.locations} className="chip">
                Areas inside Jaipur
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <CtaBand
        id="cta-title"
        title={`Looking in ${town.name}?`}
        body="Tell us what you need: a plot, land or a home built on your own plot. We reply within one working day."
        primary={{ href: contactHref('site-visit', town.name), label: 'Book a site visit' }}
        secondary={{ href: routes.contact, label: 'Contact us' }}
      />
    </>
  )
}
