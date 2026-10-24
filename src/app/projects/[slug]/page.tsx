import { Building2, CalendarCheck, ExternalLink, FileText, Key, MapPin, Ruler, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { MobileActionBar } from '@/components/layout/MobileActionBar'
import { JsonLd } from '@/components/seo/JsonLd'
import { AmenityGrid } from '@/components/ui/amenities'
import { ProjectCard } from '@/components/ui/Cards'
import { KeyFacts } from '@/components/ui/KeyFacts'
import blocks from '@/components/ui/blocks.module.css'
import { getLocality, getProject, getProjects, isValidSlug } from '@/content/repository'
import { EmiCalculator } from '@/features/calculators/EmiCalculator'
import { EnquiryForm } from '@/features/enquiry/EnquiryForm'
import { Gallery } from '@/features/gallery/Gallery'
import { formatAreaRange, formatDate, formatPrice, projectStatusLabel, projectTypeLabel } from '@/lib/format'
import { contactHref, mapsHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, localityNode, projectNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from '@/components/ui/detail.module.css'

type PageProps = Readonly<{ params: Promise<{ slug: string }> }>

async function load(slug: string) {
  if (!isValidSlug(slug)) return undefined
  const project = await getProject(slug)
  const locality = project && (await getLocality(project.localitySlug))
  return project && locality ? { project, locality } : undefined
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await load((await params).slug)
  if (!data) return {}
  const { project, locality } = data
  return buildMetadata({
    ...buildTitle({ name: project.name, location: locality.name }),
    description: project.summary,
    path: routes.project(project.slug),
    modifiedTime: project.updatedAt,
    ownImage: true,
  })
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'prices', label: 'Prices' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'location', label: 'Location' },
  { id: 'updates', label: 'Progress' },
  { id: 'emi', label: 'EMI' },
] as const

export default async function ProjectPage({ params }: PageProps) {
  const data = await load((await params).slug)
  if (!data) notFound()
  const { project, locality } = data
  const similar = (await getProjects()).filter((p) => p.slug !== project.slug).slice(0, 3)
  const path = routes.project(project.slug)
  const crumbs = [
    { name: 'Home', path: routes.home },
    { name: 'Projects', path: routes.projects },
    { name: project.name, path },
  ] as const
  const firstPrice = project.configurations.find((c) => c.price)?.price?.amount

  return (
    <>
      <JsonLd graph={graph(projectNode(project, locality), breadcrumbNode(path, crumbs), localityNode(locality))} />
      <Breadcrumbs crumbs={crumbs} />

      <div className="container">
        <header className={styles.header}>
          <div className={styles.badges}>
            <span className="badge badge--gold">{projectStatusLabel[project.status]}</span>
            <span className="badge">{projectTypeLabel[project.type]}</span>
            {project.rera && (
              <span className="badge badge--success">
                <ShieldCheck aria-hidden="true" className="icon" strokeWidth={2} /> RERA {project.rera}
              </span>
            )}
          </div>
          <h1 className={styles.title}>
            {project.name}, {locality.name}
          </h1>
          <p className={styles.location}>
            <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} />
            {locality.name}, Jaipur · {project.tagline}
          </p>
          <div className={styles.priceRow}>
            <p className={styles.price}>
              <span className={styles.priceLabel}>{project.priceFrom ? 'Starting from' : 'Price'}</span>
              {formatPrice(project.priceFrom)}
              {project.priceFrom && <span className={styles.priceNote}>+ registration &amp; govt. charges</span>}
            </p>
            <div className={styles.headerActions}>
              <Link href={contactHref('site-visit', project.slug)} className="button button--gold">
                <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
                Book a site visit
              </Link>
              <Link href={contactHref('buy', project.slug)} className="button button--outline">
                <FileText aria-hidden="true" strokeWidth={1.75} />
                Get price list
              </Link>
            </div>
          </div>
        </header>

        <Gallery images={project.gallery} title={project.name} />

        <nav aria-label="On this page" className={blocks.anchorNav}>
          <ul role="list" className={blocks.anchorList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={blocks.detail}>
          <div>
            <section id="overview" className={blocks.block} aria-labelledby="overview-title">
              <h2 id="overview-title" className={blocks.blockTitle}>
                Overview
              </h2>
              <KeyFacts
                label="Project facts"
                facts={[
                  { label: 'Configurations', value: project.configurations.map((c) => c.label).join(', '), icon: Building2 },
                  { label: 'Sizes', value: project.configurations.map((c) => formatAreaRange(c.area)).join(' · '), icon: Ruler },
                  { label: 'Possession', value: project.possession, icon: Key },
                  ...project.facts.map((fact) => ({ label: fact.label, value: fact.value })),
                ]}
              />
              {project.description.map((paragraph) => (
                <p key={paragraph} className={blocks.lead}>
                  {paragraph}
                </p>
              ))}
            </section>

            <section id="prices" className={blocks.block} aria-labelledby="prices-title">
              <h2 id="prices-title" className={blocks.blockTitle}>
                Configurations and prices
              </h2>
              <div className={blocks.tableWrap}>
                <table className={blocks.table}>
                  <caption className="visually-hidden">Configurations, sizes and prices at {project.name}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Type</th>
                      <th scope="col">Size</th>
                      <th scope="col">Price</th>
                      <th scope="col">
                        <span className="visually-hidden">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.configurations.map((config) => (
                      <tr key={config.label}>
                        <th scope="row">{config.label}</th>
                        <td className="nums">{formatAreaRange(config.area)}</td>
                        <td className={blocks.priceCell}>{config.price ? `${formatPrice(config.price)} onwards` : 'On request'}</td>
                        <td>
                          <Link href={contactHref('buy', project.slug)} className="link-more">
                            Enquire
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={blocks.note}>Prices exclude registration, stamp duty, GST and other statutory charges where applicable.</p>
            </section>

            <section id="amenities" className={blocks.block} aria-labelledby="amenities-title">
              <h2 id="amenities-title" className={blocks.blockTitle}>
                Amenities
              </h2>
              <AmenityGrid amenities={project.amenities} />
            </section>

            <section id="specifications" className={blocks.block} aria-labelledby="specs-title">
              <h2 id="specs-title" className={blocks.blockTitle}>
                Specifications
              </h2>
              <div className={blocks.specGrid}>
                {project.specifications.map((spec) => (
                  <div key={spec.group} className={blocks.specGroup}>
                    <h3>{spec.group}</h3>
                    <ul>
                      {spec.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section id="location" className={blocks.block} aria-labelledby="location-title">
              <h2 id="location-title" className={blocks.blockTitle}>
                Location: {locality.name}, Jaipur
              </h2>
              <p className={blocks.lead}>{locality.summary}</p>
              <ul role="list" className={blocks.nearby}>
                {project.nearby.map((place) => (
                  <li key={place.place}>
                    <span>{place.place}</span>
                    <strong className="nums">≈ {place.km} km</strong>
                  </li>
                ))}
              </ul>
              <p className={styles.mapLinks}>
                <a href={mapsHref(project.geo)} target="_blank" rel="noopener noreferrer" className="link-more">
                  Open in Google Maps <ExternalLink aria-hidden="true" strokeWidth={1.75} />
                </a>
                <Link href={routes.location(locality.slug)} className="link-more">
                  More about {locality.name}
                </Link>
              </p>
            </section>

            <section id="updates" className={blocks.block} aria-labelledby="updates-title">
              <h2 id="updates-title" className={blocks.blockTitle}>
                Construction progress
              </h2>
              <ol className={blocks.timeline}>
                {project.updates.map((update) => (
                  <li key={update.date}>
                    <time dateTime={update.date}>{formatDate(update.date)}</time>
                    <p>{update.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section id="emi" className={blocks.block} aria-labelledby="emi-title">
              <h2 id="emi-title" className={blocks.blockTitle}>
                Home loan EMI calculator
              </h2>
              <EmiCalculator price={firstPrice} />
            </section>
          </div>

          <aside className={blocks.sticky} aria-labelledby="visit-title">
            <div className={blocks.panel}>
              <h2 id="visit-title" className={blocks.panelTitle}>
                Book a free site visit
              </h2>
              <p className={blocks.note}>Pick a day; we’ll call to confirm and arrange the visit.</p>
              <EnquiryForm variant="compact" about={{ slug: project.slug, name: project.name }} />
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section" aria-labelledby="similar-title">
          <div className="container">
            <h2 id="similar-title" className={styles.similarTitle}>
              More projects in Jaipur
            </h2>
            <div className="grid-cards">
              {similar.map((p) => (
                <ProjectCard key={p.slug} item={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileActionBar enquireHref={contactHref('site-visit', project.slug)} label="Book a site visit" />
    </>
  )
}
