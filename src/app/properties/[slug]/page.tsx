import { BedDouble, CalendarCheck, Compass, ExternalLink, Key, Layers, MapPin, Ruler, Sofa } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { MobileActionBar } from '@/components/layout/MobileActionBar'
import { JsonLd } from '@/components/seo/JsonLd'
import { PropertyCard } from '@/components/ui/Cards'
import { KeyFacts, type Fact } from '@/components/ui/KeyFacts'
import blocks from '@/components/ui/blocks.module.css'
import { getLocality, getProperties, getProperty, isValidSlug } from '@/content/repository'
import type { PropertyType } from '@/content/types'
import { EmiCalculator } from '@/features/calculators/EmiCalculator'
import { EnquiryForm } from '@/features/enquiry/EnquiryForm'
import { Gallery } from '@/features/gallery/Gallery'
import { formatArea, formatDate, formatPrice, formatPriceFull, furnishingLabel, possessionText, propertyTypeLabel } from '@/lib/format'
import { contactHref, mapsHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, localityNode, propertyNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from '@/components/ui/detail.module.css'

type PageProps = Readonly<{ params: Promise<{ slug: string }> }>

const areaFactLabel: Readonly<Record<PropertyType, string>> = {
  apartment: 'Area',
  villa: 'Area',
  commercial: 'Area',
  plot: 'Plot size',
  agricultural: 'Land area',
}

async function load(slug: string) {
  if (!isValidSlug(slug)) return undefined
  const property = await getProperty(slug)
  const locality = property && (await getLocality(property.localitySlug))
  return property && locality ? { property, locality } : undefined
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await load((await params).slug)
  if (!data) return {}
  const { property } = data
  return buildMetadata({
    ...buildTitle({ name: property.title }),
    description: property.summary,
    path: routes.property(property.slug),
    modifiedTime: property.updatedAt,
    ownImage: true,
  })
}

export default async function PropertyPage({ params }: PageProps) {
  const data = await load((await params).slug)
  if (!data) notFound()
  const { property, locality } = data
  const similar = (await getProperties({ type: property.type })).filter((p) => p.slug !== property.slug).slice(0, 3)
  const path = routes.property(property.slug)
  const crumbs = [
    { name: 'Home', path: routes.home },
    { name: 'Properties', path: routes.properties },
    { name: property.title, path },
  ] as const

  const facts: Fact[] = [
    { label: 'Type', value: propertyTypeLabel[property.type], icon: Layers },
    ...(property.bhk ? [{ label: 'Bedrooms', value: `${property.bhk} BHK`, icon: BedDouble }] : []),
    { label: areaFactLabel[property.type], value: formatArea(property.area), icon: Ruler },
    { label: 'Possession', value: possessionText(property.type, property.possession), icon: Key },
    ...(property.furnishing ? [{ label: 'Furnishing', value: furnishingLabel[property.furnishing], icon: Sofa }] : []),
    ...(property.facing ? [{ label: 'Facing', value: property.facing, icon: Compass }] : []),
    ...(property.floor ? [{ label: 'Floor', value: property.floor }] : []),
  ]

  return (
    <>
      <JsonLd graph={graph(propertyNode(property), breadcrumbNode(path, crumbs), localityNode(locality))} />
      <Breadcrumbs crumbs={crumbs} />

      <div className="container">
        <header className={styles.header}>
          <div className={styles.badges}>
            <span className={`badge ${property.possession === 'ready' ? 'badge--success' : 'badge--info'}`}>
              {possessionText(property.type, property.possession)}
            </span>
            <span className="badge">{propertyTypeLabel[property.type]}</span>
          </div>
          <h1 className={styles.title}>{property.title}</h1>
          <p className={styles.location}>
            <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} />
            {locality.name}, Jaipur · Listed {formatDate(property.listedAt)}
          </p>
          <div className={styles.priceRow}>
            <p className={styles.price}>
              <span className={styles.priceLabel}>Asking price</span>
              {formatPrice(property.price)}
              <span className={styles.priceNote}>{formatPriceFull(property.price)}</span>
            </p>
            <div className={styles.headerActions}>
              <Link href={contactHref('site-visit', property.slug)} className="button button--gold">
                <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
                Schedule a visit
              </Link>
            </div>
          </div>
        </header>

        <Gallery images={property.gallery} title={property.title} />

        <div className={blocks.detail}>
          <div>
            <section className={blocks.block} aria-labelledby="facts-title">
              <h2 id="facts-title" className={blocks.blockTitle}>
                Property details
              </h2>
              <KeyFacts label="Property details" facts={facts} />
              {property.description.map((paragraph) => (
                <p key={paragraph} className={blocks.lead}>
                  {paragraph}
                </p>
              ))}
            </section>

            <section className={blocks.block} aria-labelledby="features-title">
              <h2 id="features-title" className={blocks.blockTitle}>
                Highlights
              </h2>
              <ul role="list" className="chips">
                {property.features.map((feature) => (
                  <li key={feature} className="chip">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section className={blocks.block} aria-labelledby="location-title">
              <h2 id="location-title" className={blocks.blockTitle}>
                Location: {locality.name}
              </h2>
              <p className={blocks.lead}>{locality.summary}</p>
              <p className={styles.mapLinks}>
                <a href={mapsHref(locality.geo)} target="_blank" rel="noopener noreferrer" className="link-more">
                  {locality.name} on Google Maps <ExternalLink aria-hidden="true" strokeWidth={1.75} />
                </a>
                <Link href={routes.location(locality.slug)} className="link-more">
                  Living in {locality.name}
                </Link>
              </p>
            </section>

            <section className={blocks.block} aria-labelledby="emi-title">
              <h2 id="emi-title" className={blocks.blockTitle}>
                EMI calculator
              </h2>
              <EmiCalculator price={property.price.amount} />
            </section>
          </div>

          <aside className={blocks.sticky} aria-labelledby="visit-title">
            <div className={blocks.panel}>
              <h2 id="visit-title" className={blocks.panelTitle}>
                Interested? Visit this property
              </h2>
              <p className={blocks.note}>Pick a day; we’ll call to confirm.</p>
              <EnquiryForm variant="compact" about={{ slug: property.slug, name: property.title }} />
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section" aria-labelledby="similar-title">
          <div className="container">
            <h2 id="similar-title" className={styles.similarTitle}>
              Similar properties
            </h2>
            <div className="grid-cards">
              {similar.map((p) => (
                <PropertyCard key={p.slug} item={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileActionBar enquireHref={contactHref('site-visit', property.slug)} label="Schedule a visit" />
    </>
  )
}
