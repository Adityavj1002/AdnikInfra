import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building,
  CalendarClock,
  ClipboardCheck,
  FileText,
  House,
  IndianRupee,
  LandPlot,
  MapPin,
  Store,
  Wheat,
  Wrench,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectCard, PropertyCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import type { PropertyType } from '@/content/types'
import { getLocalities, getPackages, getPosts, getProjects, getProperties, getStats, getTowns } from '@/content/repository'
import { services } from '@/content/services'
import { PropertySearch } from '@/features/search/PropertySearch'
import { formatDate, formatPrice, projectStatusLabel, projectTypeLabel } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { graph, webPageNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './home.module.css'

const description = site.description
const { title } = buildTitle({ name: 'Builders in Jaipur for Modern Homes & Villas' })

export const metadata = buildMetadata({ title, description, path: routes.home, ownImage: true })

function BuildingIcon({ strokeWidth = 1.75, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M3 22V10a1 1 0 0 1 1-1h2" />
      <path d="M18 9h2a1 1 0 0 1 1 1v12" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <line x1="2" y1="22" x2="22" y2="22" />
    </svg>
  )
}

function WarehouseIcon({ strokeWidth = 1.75, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
      <path d="M7 22v-8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8" />
      <line x1="7" y1="16" x2="17" y2="16" />
      <line x1="7" y1="19" x2="17" y2="19" />
    </svg>
  )
}

function RoadsIcon({ strokeWidth = 1.75, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="16" width="6" height="5" rx="2.5" />
      <rect x="15" y="3" width="6" height="5" rx="2.5" />
      <path d="M9 18.5h4a3.5 3.5 0 0 0 3.5-3.5v-6A3.5 3.5 0 0 1 20 5.5" />
      <path d="M4 16a3.5 3.5 0 0 1 3.5-3.5v-1A3.5 3.5 0 0 0 4 8" strokeDasharray="2 2" />
    </svg>
  )
}

function ProjectManagementIcon({ strokeWidth = 1.75, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1z" />
      <path d="M9 12l2 2 4-4" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}

function RealEstateIcon({ strokeWidth = 1.75, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function EnvironmentalIcon({ strokeWidth = 1.75, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

const serviceIcons: Readonly<Record<string, typeof BuildingIcon>> = {
  '01': BuildingIcon,
  '02': WarehouseIcon,
  '03': RoadsIcon,
  '04': ProjectManagementIcon,
  '05': RealEstateIcon,
  '06': EnvironmentalIcon,
}

const categories = services.map((service) => ({ ...service, icon: serviceIcons[service.number] ?? BuildingIcon }))

const reasons = [
  { icon: BadgeCheck, title: 'Clear paperwork', body: 'Title, approvals and registration documents shared before you book.' },
  { icon: IndianRupee, title: 'Transparent pricing', body: 'All-inclusive price sheets, with statutory charges listed separately.' },
  { icon: ClipboardCheck, title: 'Quality checked', body: 'Stage-wise inspections with photos and reports you can see.' },
  { icon: CalendarClock, title: 'Progress you can track', body: 'Monthly construction updates for every project and home.' },
  { icon: FileText, title: 'Written specifications', body: 'Brands and materials named in your agreement, not just promised.' },
  { icon: Wrench, title: 'After-handover support', body: 'A dedicated team for snags and maintenance after you move in.' },
] as const

/** Quick links into the listings, worded the way people search. */
const browseTypes: readonly Readonly<{ type: PropertyType; label: string; icon: typeof Building }>[] = [
  { type: 'apartment', label: 'Flats in Jaipur', icon: Building },
  { type: 'villa', label: 'Villas & houses', icon: House },
  { type: 'plot', label: 'Residential plots', icon: LandPlot },
  { type: 'commercial', label: 'Commercial property', icon: Store },
  { type: 'agricultural', label: 'Agricultural land near Jaipur', icon: Wheat },
]

/** How a home goes up, bottom layer first: drives both the 3D stack and the step list. */
const buildSteps = [
  { layer: 'Plan & approvals', title: 'Design and approvals', body: 'Architectural and structural drawings, and the building-plan approval paperwork, handled for you.' },
  { layer: 'Foundation', title: 'Foundation and structure', body: 'Soil test, footings and the RCC frame, inspected and photographed at every stage.' },
  { layer: 'Walls & services', title: 'Walls, plumbing and wiring', body: 'Masonry, electrical and plumbing to the drawings, with modular and prefab options to save time.' },
  { layer: 'Finishes', title: 'Finishes and handover', body: 'Flooring, fittings and paint in the brands named in your agreement, then a snag check and the keys.' },
] as const

export default async function HomePage() {
  const [projects, properties, localities, packages, stats, posts, towns] = await Promise.all([
    getProjects(),
    getProperties(),
    getLocalities(),
    getPackages(),
    getStats(),
    getPosts(),
    getTowns(),
  ])
  const localityOf = (slug: string) => localities.find((l) => l.slug === slug)
  const fromRate = Math.min(...packages.map((p) => p.ratePerSqft))
  const spotlight = projects.find((p) => p.featured) ?? projects[0]
  const moreProjects = projects.filter((p) => p.slug !== spotlight?.slug).slice(0, 3)
  const spotlightLocality = spotlight ? localityOf(spotlight.localitySlug) : undefined
  const typeCount = (type: PropertyType) => properties.filter((p) => p.type === type).length
  const { corridors } = site.serviceArea

  return (
    <>
      <JsonLd graph={graph(webPageNode({ path: routes.home, name: title, description }))} />

      {/* Hero: dusk photograph on a navy stage, tilting into place in 3D, with glass panels. */}
      {/* data-header-overlay: the site header floats over this hero (SiteHeader.module.css). */}
      <section className={styles.hero} aria-labelledby="hero-title" data-header-overlay>
        <div className={styles.heroStage}>
          <Image
            src={photos.heroVillaPool.src}
            alt={photos.heroVillaPool.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            placeholder="blur"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroFrame} aria-hidden="true" />

        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={`eyebrow ${styles.heroEyebrow}`}>
              {site.descriptor} · {site.city} &amp; nearby
            </p>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span className={styles.heroAccent}>Modern homes</span> by trusted builders in Jaipur
            </h1>
            <p className={styles.heroLead}>
              Villas, apartments, plots and agricultural land across Jaipur and nearby towns, designed, built and sold by
              one team. Or bring your plot, and we build your home on it.
            </p>
            <div className={styles.heroActions}>
              <Link href={routes.projects} className="button button--gold">
                Explore projects
                <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
              <Link href={routes.construction} className={`button ${styles.glassButton}`}>
                Build on your plot
              </Link>
            </div>
          </div>

          {spotlight?.gallery[0] && (
            <Link href={routes.project(spotlight.slug)} className={styles.heroCard}>
              <span className={styles.heroCardMedia}>
                <Image src={spotlight.gallery[0].src} alt="" fill sizes="(min-width: 64rem) 22rem, 1px" />
              </span>
              <span className={styles.heroCardBody}>
                <span className={styles.heroCardKicker}>Featured · {projectStatusLabel[spotlight.status]}</span>
                <span className={styles.heroCardTitle}>{spotlight.name}</span>
                {spotlightLocality && (
                  <span className={styles.heroCardMeta}>
                    <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {spotlightLocality.name}, {site.city}
                  </span>
                )}
                <span className={styles.heroCardPrice}>
                  From <strong>{formatPrice(spotlight.priceFrom)}</strong>
                </span>
              </span>
              <ArrowUpRight aria-hidden="true" className={styles.heroCardArrow} strokeWidth={1.75} />
            </Link>
          )}
        </div>

        {stats.length > 0 && (
          <div className={`container ${styles.heroStatsWrap}`}>
            <dl className={styles.heroStats} aria-label="Company figures">
              {stats.map((stat) => (
                <div key={stat.label} className={styles.heroStat}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <div className={`container ${styles.searchWrap}`}>
        <PropertySearch localities={localities} />
      </div>

      {/* Browse by type */}
      <nav className={`container ${styles.types}`} aria-label="Browse property by type">
        <ul role="list" className={styles.typeList}>
          {browseTypes.map(({ type, label, icon: Icon }) => {
            const count = typeCount(type)
            return (
              <li key={type}>
                <Link href={`${routes.properties}?type=${type}`} className={styles.typeTile}>
                  <Icon aria-hidden="true" className={styles.typeIcon} strokeWidth={1.5} />
                  <span className={styles.typeLabel}>{label}</span>
                  <span className={styles.typeCount}>
                    {count > 0 ? `${count} ${count === 1 ? 'listing' : 'listings'}` : 'Ask us'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Services */}
      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <SectionHeading
            id="categories-title"
            eyebrow="Our Services"
            title="Comprehensive Construction & Real Estate Solutions"
            intro={<p>Thoughtful planning, precision engineering and end-to-end execution across Jaipur and nearby towns.</p>}
          />
          <ul role="list" className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <li key={cat.number} className="reveal">
                <Link
                  href={cat.href}
                  className={`${styles.categoryCard} ${cat.highlight ? styles.categoryCardHighlight : ''}`}
                >
                  <div className={styles.categoryTop}>
                    <span className={styles.categoryIcon} aria-hidden="true">
                      <cat.icon strokeWidth={1.5} />
                    </span>
                    <span className={styles.categoryNumber}>{cat.number}</span>
                  </div>
                  <div className={styles.categoryContent}>
                    <h3 className={styles.categoryTitle}>{cat.title}</h3>
                    <p className={styles.categoryBody}>{cat.body}</p>
                  </div>
                  <div className={styles.categoryFooter}>
                    <span className={styles.categoryCta}>Explore Service</span>
                    <span className={styles.categoryArrow} aria-hidden="true">
                      <ArrowUpRight strokeWidth={2} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Projects: one spotlight in layered 3D, then the rest as cards */}
      <section className="section section--raised" aria-labelledby="projects-title">
        <div className="container">
          <SectionHeading
            id="projects-title"
            eyebrow="Our projects"
            title="New residential projects across Jaipur"
            intro={<p>Gated villa communities, apartments and plotted developments, built and sold by us.</p>}
            action={
              <Link href={routes.projects} className="link-more">
                All projects <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            }
          />
          {spotlight && (
            <article className={styles.spotlight}>
              <div className={styles.spotlightMedia}>
                {spotlight.gallery[1] && (
                  <div className={styles.spotlightBack} aria-hidden="true">
                    <Image src={spotlight.gallery[1].src} alt="" fill sizes="(min-width: 64rem) 30vw, 60vw" placeholder="blur" />
                  </div>
                )}
                {spotlight.gallery[0] && (
                  <div className={styles.spotlightFront}>
                    <Image
                      src={spotlight.gallery[0].src}
                      alt={spotlight.gallery[0].alt}
                      fill
                      sizes="(min-width: 64rem) 45vw, 100vw"
                      placeholder="blur"
                    />
                    <span className={`badge badge--gold ${styles.spotlightBadge}`}>{projectStatusLabel[spotlight.status]}</span>
                  </div>
                )}
              </div>
              <div className={styles.spotlightBody}>
                <p className="eyebrow">Featured · {projectTypeLabel[spotlight.type]}</p>
                <h3 className={styles.spotlightTitle}>{spotlight.name}</h3>
                {spotlightLocality && (
                  <p className={styles.spotlightPlace}>
                    <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {spotlightLocality.name}, {site.city}
                  </p>
                )}
                <p className={styles.spotlightLead}>{spotlight.summary}</p>
                <ul role="list" className={styles.spotlightConfigs}>
                  {spotlight.configurations.map((c) => (
                    <li key={c.label}>{c.label}</li>
                  ))}
                </ul>
                <p className={styles.spotlightPrice}>
                  <span>Starting from</span>
                  <strong className="nums">{formatPrice(spotlight.priceFrom)}</strong>
                </p>
                <div className={styles.actions}>
                  <Link href={routes.project(spotlight.slug)} className="button">
                    View project <ArrowRight aria-hidden="true" strokeWidth={1.75} />
                  </Link>
                  <Link href={contactHref('site-visit', spotlight.name)} className="button button--outline">
                    Book a site visit
                  </Link>
                </div>
              </div>
            </article>
          )}
          {moreProjects.length > 0 && (
            <div className={`grid-cards ${styles.moreProjects}`}>
              {moreProjects.map((project) => (
                <ProjectCard key={project.slug} item={project} locality={localityOf(project.localitySlug)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promise: the one deep navy band */}
      <section className={`section ${styles.promise}`} aria-labelledby="promise-title">
        <div className="container">
          <div className={styles.promiseHead}>
            <p className={`eyebrow ${styles.promiseEyebrow}`}>Why families choose us</p>
            <h2 id="promise-title" className={styles.promiseTitle}>
              Real estate developers in Jaipur you can <span className={styles.promiseAccent}>visit</span>, not just call
            </h2>
            <p className={styles.promiseIntro}>Every project is designed, built and handed over by our own team.</p>
          </div>
          <ol className={styles.promiseList}>
            {reasons.map(({ icon: Icon, title: reasonTitle, body }, i) => (
              <li key={reasonTitle} className={`${styles.promiseItem} reveal`}>
                <span className={styles.promiseNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Icon aria-hidden="true" className={styles.promiseIcon} strokeWidth={1.5} />
                <h3 className={styles.promiseItemTitle}>{reasonTitle}</h3>
                <p className={styles.promiseBody}>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Construction: a home assembled in CSS 3D, layer by layer, beside the steps */}
      <section className="section" aria-labelledby="build-title">
        <div className={`container ${styles.build}`}>
          <div className={styles.iso} aria-hidden="true">
            <div className={styles.isoScene}>
              {buildSteps.map((step) => (
                <div key={step.layer} className={styles.isoPlate}>
                  <span className={styles.isoLabel}>{step.layer}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stack">
            <p className="eyebrow">Home construction</p>
            <h2 id="build-title" className={styles.h2}>
              Build your modern home on your own plot
            </h2>
            <p className={blocks.lead}>
              Bring us your plot and an idea. One team, one contract and stage-wise payments, from the first drawing to
              the day you get the keys.
            </p>
            <ol className={styles.steps}>
              {buildSteps.map((step) => (
                <li key={step.title} className={styles.step}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
            <p className={styles.fromRate}>
              Packages from <strong className="nums">₹{fromRate.toLocaleString('en-IN')}</strong> per sq ft
              <span className={blocks.note}> (indicative)</span>
            </p>
            <div className={styles.actions}>
              <Link href={`${routes.construction}#estimate`} className="button">
                Estimate your cost
              </Link>
              <Link href={contactHref('construction')} className="button button--outline">
                Talk to an engineer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real estate for sale */}
      <section className="section section--raised" aria-labelledby="properties-title">
        <div className="container">
          <SectionHeading
            id="properties-title"
            eyebrow="Real Estate"
            title="Property for sale in Jaipur and nearby"
            intro={<p>Flats, villas, plots, commercial spaces and agricultural land, each one visited and checked by our team.</p>}
            action={
              <Link href={routes.properties} className="link-more">
                Browse all <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            }
          />
          <div className="grid-cards">
            {properties.slice(0, 3).map((property) => (
              <PropertyCard key={property.slug} item={property} locality={localityOf(property.localitySlug)} />
            ))}
          </div>
        </div>
      </section>

      {/* Locations: Jaipur localities, then the corridors and towns around the city */}
      <section className="section section--ivory" aria-labelledby="locations-title">
        <div className={`container ${styles.places}`}>
          <div className="stack">
            <p className="eyebrow">Locations</p>
            <h2 id="locations-title" className={styles.h2}>
              Homes in Jaipur and the towns around it
            </h2>
            <p className={blocks.lead}>From established Vaishali Nagar to fast-growing Jagatpura, Ajmer Road and beyond.</p>
            <ul role="list" className={styles.localityList}>
              {localities.map((locality) => (
                <li key={locality.slug}>
                  <Link href={routes.location(locality.slug)} className={styles.localityRow}>
                    <span className={styles.localityName}>{locality.name}</span>
                    <span className={styles.localityZone}>{locality.zone}</span>
                    <ArrowUpRight aria-hidden="true" className={styles.localityArrow} strokeWidth={1.75} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.nearby}>
            <div className={styles.nearbyMedia}>
              <Image src={photos.jaipurAerial.src} alt={photos.jaipurAerial.alt} fill sizes="(min-width: 60rem) 45vw, 100vw" placeholder="blur" />
            </div>
            <div className={styles.nearbyCard}>
              <h3 className={styles.nearbyTitle}>Around Jaipur</h3>
              <p className={styles.nearbyBody}>
                We also build and sell along the highway corridors and in nearby towns, from Chaksu and Niwai to Malpura.
              </p>
              <p className={styles.nearbyLabel}>Corridors</p>
              <ul role="list" className={styles.tags}>
                {corridors.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <p className={styles.nearbyLabel}>Towns</p>
              <ul role="list" className={styles.tags}>
                {towns.map((town) => (
                  <li key={town.slug}>
                    <Link href={routes.town(town.slug)} className={styles.tagLink}>
                      {town.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={routes.nearJaipur} className={`link-more ${styles.nearbyMore}`}>
                Property near Jaipur <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="section" aria-labelledby="guides-title">
        <div className="container">
          <SectionHeading
            id="guides-title"
            eyebrow="Guides"
            title="Before you buy or build"
            action={
              <Link href={routes.blog} className="link-more">
                All guides <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            }
          />
          <ul role="list" className={`grid-cards ${styles.posts}`}>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={routes.post(post.slug)} className={styles.post}>
                  <span className={styles.postMedia}>
                    <Image src={post.cover.src} alt="" fill sizes="(min-width: 60rem) 30vw, 100vw" placeholder="blur" />
                  </span>
                  <span className={styles.postMeta}>
                    <time dateTime={post.published}>{formatDate(post.published)}</time> · {post.readingMinutes} min read
                  </span>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="cta-title"
        title="See your future home in person"
        body="Book a free site visit. Our team will show you the project, the plans and the prices, with no pressure to book."
        primary={{ href: contactHref('site-visit'), label: 'Book a site visit' }}
        secondary={{ href: routes.contact, label: 'Contact us' }}
      />
    </>
  )
}
