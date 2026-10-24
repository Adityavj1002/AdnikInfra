import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ClipboardCheck,
  FileText,
  IndianRupee,
  MapPin,
  Wrench,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectCard, PropertyCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatsBand } from '@/components/ui/StatsBand'
import blocks from '@/components/ui/blocks.module.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import { getLocalities, getPackages, getPosts, getProjects, getProperties, getStats } from '@/content/repository'
import { PropertySearch } from '@/features/search/PropertySearch'
import { formatDate } from '@/lib/format'
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

const categories = [
  {
    number: '01',
    icon: BuildingIcon,
    title: 'Building Construction',
    body: 'Thoughtful planning and coordinated execution for residential, commercial and institutional buildings.',
    href: routes.construction,
  },
  {
    number: '02',
    icon: WarehouseIcon,
    title: 'Warehouse Construction',
    body: 'Purpose-built industrial spaces, with a focus on operational flow, structural needs and future use.',
    href: contactHref('construction', 'Warehouse Construction'),
  },
  {
    number: '03',
    icon: RoadsIcon,
    title: 'Roads & Infrastructure',
    body: 'Civil infrastructure development that connects places and supports long-term growth.',
    href: contactHref('construction', 'Roads & Infrastructure'),
  },
  {
    number: '04',
    icon: ProjectManagementIcon,
    title: 'Project Management',
    body: 'Scope, schedule and site coordination to keep every stage of your project aligned.',
    href: contactHref('construction', 'Project Management'),
    highlight: true,
  },
  {
    number: '05',
    icon: RealEstateIcon,
    title: 'Real Estate Consultancy',
    body: 'Practical guidance for land, real estate evaluation and informed real estate decisions.',
    href: routes.properties,
  },
  {
    number: '06',
    icon: EnvironmentalIcon,
    title: 'Environmental Clearance',
    body: 'Applicability assessment, documentation and application support for environmental clearance.',
    href: contactHref('other', 'Environmental Clearance'),
  },
] as const

const reasons = [
  { icon: BadgeCheck, title: 'Clear paperwork', body: 'Title, approvals and registration documents shared before you book.' },
  { icon: IndianRupee, title: 'Transparent pricing', body: 'All-inclusive price sheets, with statutory charges listed separately.' },
  { icon: ClipboardCheck, title: 'Quality checked', body: 'Stage-wise inspections with photos and reports you can see.' },
  { icon: CalendarClock, title: 'Progress you can track', body: 'Monthly construction updates for every project and home.' },
  { icon: FileText, title: 'Written specifications', body: 'Brands and materials named in your agreement, not just promised.' },
  { icon: Wrench, title: 'After-handover support', body: 'A dedicated team for snags and maintenance after you move in.' },
] as const

const constructionPoints = [
  'Architectural and structural design included',
  'Modular and prefab-assisted options for faster builds',
  'Fixed rate per sq ft, written specification',
  'Weekly photos and a monthly site report',
] as const

export default async function HomePage() {
  const [projects, properties, localities, packages, stats, posts] = await Promise.all([
    getProjects({ featured: true }),
    getProperties(),
    getLocalities(),
    getPackages(),
    getStats(),
    getPosts(),
  ])
  const localityOf = (slug: string) => localities.find((l) => l.slug === slug)
  const fromRate = Math.min(...packages.map((p) => p.ratePerSqft))

  return (
    <>
      <JsonLd graph={graph(webPageNode({ path: routes.home, name: title, description }))} />

      {/* Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <Image
          src={photos.heroVillaDusk.src}
          alt={photos.heroVillaDusk.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          className={styles.heroImage}
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <p className={`eyebrow ${styles.heroEyebrow}`}>
            {site.descriptor} · {site.city}
          </p>
          <h1 id="hero-title" className={styles.heroTitle}>
            Modern homes by trusted builders in Jaipur
          </h1>
          <p className={styles.heroLead}>
            We design, build and sell modern villas, apartments and plots, and build your home on your own land.
          </p>
          <div className={styles.heroActions}>
            <Link href={routes.projects} className="button button--gold">
              Explore projects
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </Link>
            <Link href={routes.construction} className="button button--light">
              Build on your plot
            </Link>
          </div>
        </div>
      </section>

      <div className={`container ${styles.searchWrap}`}>
        <PropertySearch localities={localities} />
      </div>

      {/* 6 Categories Section */}
      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <SectionHeading
            id="categories-title"
            eyebrow="Our Services"
            title="Comprehensive Construction & Real Estate Solutions"
            intro={<p>Thoughtful planning, precision engineering and end-to-end execution across Jaipur.</p>}
          />
          <ul role="list" className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <li key={cat.number}>
                <Link
                  href={cat.href}
                  className={`${styles.categoryCard} ${'highlight' in cat && cat.highlight ? styles.categoryCardHighlight : ''}`}
                >
                  <div className={styles.categoryTop}>
                    <span className={styles.categoryIcon} aria-hidden="true">
                      <cat.icon strokeWidth={1.75} />
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

      {/* Featured projects */}
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
          <div className="grid-cards">
            {projects.map((project) => (
              <ProjectCard key={project.slug} item={project} locality={localityOf(project.localitySlug)} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="section section--dark" aria-labelledby="stats-title">
          <div className={`container ${styles.statsInner}`}>
            <SectionHeading
              id="stats-title"
              eyebrow="Why families choose us"
              title="Real estate developers in Jaipur you can visit, not just call"
              intro={<p>Every project is designed, built and handed over by our own team.</p>}
            />
            <StatsBand stats={stats} label="Company figures" />
          </div>
        </section>
      )}

      {/* Construction */}
      <section className="section" aria-labelledby="build-title">
        <div className="container split split--wide-end">
          <div className={blocks.media}>
            <Image src={photos.engineerSite.src} alt={photos.engineerSite.alt} fill sizes="(min-width: 60rem) 40vw, 100vw" placeholder="blur" />
          </div>
          <div className="stack">
            <p className="eyebrow">Home construction</p>
            <h2 id="build-title" className={styles.h2}>
              Build your modern home on your own plot
            </h2>
            <p className={blocks.lead}>
              Bring us your plot and an idea. We handle design, approvals, construction and handover, with one team,
              one contract and stage-wise payments.
            </p>
            <ul role="list" className={blocks.checks}>
              {constructionPoints.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" className="icon" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
            <p className={styles.fromRate}>
              Packages from <strong className="nums">₹{fromRate.toLocaleString('en-IN')}</strong> per sq ft
              <span className={blocks.note}> (indicative)</span>
            </p>
            <div className={styles.heroActionsDark}>
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
            title="Real estate for sale in Jaipur"
            intro={<p>Ready-to-move flats, villas, plots and commercial spaces, checked and listed by our team.</p>}
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

      {/* Reasons */}
      <section className="section" aria-labelledby="reasons-title">
        <div className="container">
          <SectionHeading id="reasons-title" eyebrow="Our promise" title="What you can expect from us" align="center" />
          <ul role="list" className={blocks.features}>
            {reasons.map(({ icon: Icon, title: reasonTitle, body }) => (
              <li key={reasonTitle} className={`${blocks.feature} reveal`}>
                <span className={blocks.featureIcon} aria-hidden="true">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className={blocks.featureTitle}>{reasonTitle}</h3>
                <p className={blocks.featureBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Locations */}
      <section className="section section--tint" aria-labelledby="locations-title">
        <div className="container split">
          <div className="stack">
            <p className="eyebrow">Locations</p>
            <h2 id="locations-title" className={styles.h2}>
              Homes in Jaipur’s best-connected neighbourhoods
            </h2>
            <p className={blocks.lead}>From established Vaishali Nagar to fast-growing Jagatpura and Ajmer Road.</p>
            <ul role="list" className="chips">
              {localities.map((locality) => (
                <li key={locality.slug}>
                  <Link href={routes.location(locality.slug)} className="chip">
                    <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} />
                    {locality.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={blocks.media}>
            <Image src={photos.jaipurAerial.src} alt={photos.jaipurAerial.alt} fill sizes="(min-width: 60rem) 45vw, 100vw" placeholder="blur" />
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
