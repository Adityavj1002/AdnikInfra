import { ArrowRight, CircleCheck, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { ProjectCard, PropertyCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { getLocalities, getLocality, getProjects, getProperties, isValidSlug } from '@/content/repository'
import { contactHref, mapsHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, faqNode, graph, ids, localityNode, webPageNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from '../locations.module.css'

type PageProps = Readonly<{ params: Promise<{ slug: string }> }>

async function load(slug: string) {
  return isValidSlug(slug) ? getLocality(slug) : undefined
}

const titleFor = (name: string) => buildTitle({ name: `Property in ${name}, Jaipur: Villas, Flats & Plots` })

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locality = await load((await params).slug)
  if (!locality) return {}
  return buildMetadata({ ...titleFor(locality.name), description: locality.summary, path: routes.location(locality.slug) })
}

export default async function LocalityPage({ params }: PageProps) {
  const locality = await load((await params).slug)
  if (!locality) notFound()

  const [projects, properties, others] = await Promise.all([
    getProjects({ locality: locality.slug }),
    getProperties({ locality: locality.slug }),
    getLocalities(),
  ])
  const path = routes.location(locality.slug)
  const { title } = titleFor(locality.name)
  const crumbs = [
    { name: 'Home', path: routes.home },
    { name: 'Locations', path: routes.locations },
    { name: locality.name, path },
  ] as const

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path, name: title, description: locality.summary, breadcrumb: true, about: ids.locality(locality.slug) }),
          breadcrumbNode(path, crumbs),
          localityNode(locality),
          ...(locality.faqs.length > 0 ? [faqNode(path, locality.faqs)] : []),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow={locality.zone}
        title={`Property in ${locality.name}, Jaipur`}
        lead={<p>{locality.summary}</p>}
      >
        <Link href={contactHref('site-visit')} className="button button--gold">
          Visit homes in {locality.name}
        </Link>
        <a href={mapsHref(locality.geo)} target="_blank" rel="noopener noreferrer" className="button button--outline">
          View on map <ExternalLink aria-hidden="true" strokeWidth={1.75} />
        </a>
      </PageHero>

      <section className="section section--tight" aria-labelledby="about-title">
        <div className={`container ${styles.intro}`}>
          <h2 id="about-title" className={blocks.blockTitle}>
            Living in {locality.name}
          </h2>
          {locality.intro.map((paragraph) => (
            <p key={paragraph} className={blocks.lead}>
              {paragraph}
            </p>
          ))}
          <ul role="list" className={styles.highlights}>
            {locality.highlights.map((highlight) => (
              <li key={highlight}>
                <CircleCheck aria-hidden="true" className="icon" strokeWidth={1.75} />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section section--raised" aria-labelledby="projects-title">
          <div className="container">
            <SectionHeading id="projects-title" eyebrow="Our projects" title={`Builders in ${locality.name}: our projects here`} />
            <div className="grid-cards">
              {projects.map((project) => (
                <ProjectCard key={project.slug} item={project} locality={locality} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="properties-title">
        <div className="container">
          <SectionHeading
            id="properties-title"
            eyebrow="For sale"
            title={`Villas and flats in ${locality.name}`}
            action={
              <Link href={`${routes.properties}?locality=${locality.slug}`} className="link-more">
                Search {locality.name} <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            }
          />
          {properties.length > 0 ? (
            <div className="grid-cards">
              {properties.map((property) => (
                <PropertyCard key={property.slug} item={property} locality={locality} />
              ))}
            </div>
          ) : (
            <div className={blocks.empty}>
              <p>No listings in {locality.name} today. New homes are added every week.</p>
              <Link href={contactHref('buy')} className="button">
                Get notified first
              </Link>
            </div>
          )}
        </div>
      </section>

      {locality.faqs.length > 0 && (
        <section className="section section--raised" aria-labelledby="faq-title">
          <div className="container">
            <SectionHeading id="faq-title" eyebrow="Questions" title={`Buying in ${locality.name}`} />
            <FaqList faqs={locality.faqs} />
          </div>
        </section>
      )}

      <section className="section section--tight" aria-labelledby="nearby-title">
        <div className="container">
          <h2 id="nearby-title" className={blocks.blockTitle}>
            Other areas in Jaipur
          </h2>
          <ul role="list" className="chips">
            {others
              .filter((other) => other.slug !== locality.slug)
              .map((other) => (
                <li key={other.slug}>
                  <Link href={routes.location(other.slug)} className="chip">
                    {other.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="locality-cta"
        title={`Looking in ${locality.name}?`}
        body="Tell us your budget and must-haves; we’ll shortlist homes and plan your visits."
        primary={{ href: contactHref('buy'), label: 'Start my shortlist' }}
      />
    </>
  )
}
