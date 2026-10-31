import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  Factory,
  FileText,
  Leaf,
  MapPin,
  Mountain,
  Pickaxe,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { JsonLd } from '@/components/seo/JsonLd'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import { getLocalities, getProjects, getStats } from '@/content/repository'
import { services } from '@/content/services'
import { formatPrice, projectStatusLabel, projectTypeLabel } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { graph, webPageNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './home.module.css'

const description = `${site.name}, ${site.city}: construction advisory, environmental clearance, project management, real estate consultancy and infrastructure development.`
const { title } = buildTitle({ name: `Infrastructure Consultants in ${site.city}` })

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
  'construction-advisory': BuildingIcon,
  'environmental-clearance': EnvironmentalIcon,
  'project-management': ProjectManagementIcon,
  'real-estate-consultancy': RealEstateIcon,
  'infrastructure-development': RoadsIcon,
}

const categories = services.map((service) => ({ ...service, icon: serviceIcons[service.slug] ?? BuildingIcon }))

/** Where an enquiry with no particular service in mind goes: the proposal request. */
const proposalHref = contactHref('proposal')

const sectors = [
  {
    slug: 'infrastructure',
    icon: Building2,
    title: 'Infrastructure',
    body: 'Hospitals, institutions, hotels, commercial buildings, warehouses, townships, roads and utilities.',
  },
  { slug: 'industrial', icon: Factory, title: 'Industrial', body: 'Factories, processing plants, industrial estates and warehousing parks.' },
  { slug: 'mining', icon: Pickaxe, title: 'Mining', body: 'Major and minor minerals, quarries and sand: mine planning, lease approvals and closure.' },
] as const

const clearances = [
  {
    icon: FileText,
    title: 'EIA and Environmental Clearance',
    body: 'Screening, scoping, EIA/EMP reports and public hearing support.',
    sectors: 'Infrastructure · Industrial · Mining',
  },
  {
    icon: ClipboardCheck,
    title: 'Pollution Control Board consents',
    body: 'Consent to Establish and Operate applications and renewals.',
    sectors: 'Infrastructure · Industrial · Mining',
  },
  {
    icon: Zap,
    title: 'ECBC and ENS energy compliance',
    body: 'Building envelope, HVAC and lighting compliance reports with energy modelling.',
    sectors: 'Infrastructure',
  },
  {
    icon: Mountain,
    title: 'Mine closure and reclamation plans',
    body: 'Progressive and final closure plans, land restoration and post-closure monitoring.',
    sectors: 'Mining',
  },
  {
    icon: Activity,
    title: 'Monitoring and audits',
    body: 'Air, water, noise and soil monitoring, plus statutory environmental audits.',
    sectors: 'Infrastructure · Industrial · Mining',
  },
  {
    icon: Leaf,
    title: 'Green building certification',
    body: 'GRIHA and related rating support for new buildings and campuses.',
    sectors: 'Infrastructure',
  },
] as const

/** The three founding disciplines. Founder names, portraits and bios go here once supplied. */
const disciplines = [
  { icon: Building2, title: 'Head, Infrastructure' },
  { icon: Pickaxe, title: 'Head, Mining' },
  { icon: Leaf, title: 'Head, Environmental Clearance' },
] as const

/** How we work, bottom layer first: drives both the 3D stack and the step list. */
const workSteps = [
  {
    layer: 'Plan',
    title: 'Plan',
    body: 'We review the site, the scope and the approvals your project needs, and agree a realistic programme and budget.',
  },
  {
    layer: 'Comply',
    title: 'Comply',
    body: 'Environmental clearance, consents and code compliance are prepared and filed before they can hold up the work.',
  },
  {
    layer: 'Build',
    title: 'Build',
    body: 'Advisory and project management support on site, with quality and cost tracked against the plan.',
  },
  {
    layer: 'Grow',
    title: 'Grow',
    body: 'Monitoring, periodic compliance reports and renewals keep the project in good standing as it expands.',
  },
] as const

export default async function HomePage() {
  const [projects, localities, stats] = await Promise.all([getProjects(), getLocalities(), getStats()])
  const localityOf = (slug: string) => localities.find((l) => l.slug === slug)
  const spotlight = projects.find((p) => p.featured) ?? projects[0]
  const moreProjects = projects.filter((p) => p.slug !== spotlight?.slug).slice(0, 3)
  const spotlightLocality = spotlight ? localityOf(spotlight.localitySlug) : undefined

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
            <p className={`eyebrow ${styles.heroEyebrow}`}>Infrastructure consultants</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span className={styles.heroAccent}>Plan. Comply.</span> Build. Grow.
            </h1>
            <p className={styles.heroLead}>
              {site.name} advises on construction, environmental clearance, project management, real estate and
              infrastructure development, so your project is planned right, approved on time and built to last.
            </p>
            <div className={styles.heroActions}>
              <Link href={proposalHref} className="button button--gold">
                Request a proposal
                <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
              <Link href="#projects" className={`button ${styles.glassButton}`}>
                See our work
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

      {/* Services */}
      <section id="services" className="section" aria-labelledby="categories-title">
        <div className="container">
          <SectionHeading
            id="categories-title"
            eyebrow="Our services"
            title="Five services, one team from first plan to final approval"
          />
          <ul role="list" className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <li key={cat.slug} className="reveal">
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
                    <span className={styles.categoryCta}>{cat.cta ?? 'Explore Service'}</span>
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

      {/* Sectors */}
      <section id="sectors" className="section section--raised" aria-labelledby="sectors-title">
        <div className="container">
          <SectionHeading id="sectors-title" eyebrow="Sectors we serve" title="Infrastructure, industrial and mining" />
          <ul role="list" className={styles.categoriesGrid}>
            {sectors.map(({ slug, icon: Icon, title: sectorTitle, body }, i) => (
              <li key={sectorTitle} className="reveal">
                <Link href={routes.sector(slug)} className={styles.categoryCard}>
                  <div className={styles.categoryTop}>
                    <span className={styles.categoryIcon} aria-hidden="true">
                      <Icon strokeWidth={1.5} />
                    </span>
                    <span className={styles.categoryNumber}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.categoryContent}>
                    <h3 className={styles.categoryTitle}>{sectorTitle}</h3>
                    <p className={styles.categoryBody}>{body}</p>
                  </div>
                  <div className={styles.categoryFooter}>
                    <span className={styles.categoryCta}>See what we do</span>
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

      {/* Environmental clearance: the one deep navy band */}
      <section id="clearance" className={`section ${styles.promise}`} aria-labelledby="clearance-title">
        <div className="container">
          <div className={styles.promiseHead}>
            <p className={`eyebrow ${styles.promiseEyebrow}`}>Environmental Clearance</p>
            <h2 id="clearance-title" className={styles.promiseTitle}>
              Clearances and compliance, <span className={styles.promiseAccent}>handled in-house</span>
            </h2>
            <p className={styles.promiseIntro}>
              Most project delays come from approvals. Our environmental team works across all our services, so
              assessments, consents and energy compliance are planned in with the design and the mine plan, not chased at
              the end. It also takes on independent clients across infrastructure, industrial and mining projects.
            </p>
            <div className={styles.actions}>
              <Link href={routes.environmentalClearance} className="button button--gold">
                See all clearance services <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
          <ol className={styles.promiseList}>
            {clearances.map(({ icon: Icon, title: clearanceTitle, body, sectors: tags }, i) => (
              <li key={clearanceTitle} className={`${styles.promiseItem} reveal`}>
                <span className={styles.promiseNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Icon aria-hidden="true" className={styles.promiseIcon} strokeWidth={1.5} />
                <h3 className={styles.promiseItemTitle}>{clearanceTitle}</h3>
                <p className={styles.promiseBody}>{body}</p>
                <p className={styles.promiseTag}>{tags}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How we work: the four stages stacked in CSS 3D, layer by layer, beside the steps */}
      <section className="section" aria-labelledby="process-title">
        <div className={`container ${styles.build}`}>
          <div className={styles.iso} aria-hidden="true">
            <div className={styles.isoScene}>
              {workSteps.map((step) => (
                <div key={step.layer} className={styles.isoPlate}>
                  <span className={styles.isoLabel}>{step.layer}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stack">
            <p className="eyebrow">How we work</p>
            <h2 id="process-title" className={styles.h2}>
              Plan. Comply. Build. Grow.
            </h2>
            <ol className={styles.steps}>
              {workSteps.map((step) => (
                <li key={step.title} className={styles.step}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Projects: one spotlight in layered 3D, then the rest as cards */}
      <section id="projects" className="section section--raised" aria-labelledby="projects-title">
        <div className="container">
          <SectionHeading
            id="projects-title"
            eyebrow="Projects"
            title="Selected work"
            action={
              <Link href={routes.projects} className="link-more">
                View all projects <ArrowRight aria-hidden="true" strokeWidth={1.75} />
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
                  <Link href={contactHref('site-visit', spotlight.slug)} className="button button--outline">
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

      {/* About: one founder per discipline */}
      <section id="team" className="section" aria-labelledby="team-title">
        <div className="container">
          <SectionHeading
            id="team-title"
            eyebrow="About us"
            title="Three founders, three disciplines"
          />
          <ul role="list" className={styles.categoriesGrid}>
            {disciplines.map(({ icon: Icon, title: disciplineTitle }, i) => (
              <li key={disciplineTitle} className="reveal">
                <Link href={routes.about} className={styles.categoryCard}>
                  <div className={styles.categoryTop}>
                    <span className={styles.categoryIcon} aria-hidden="true">
                      <Icon strokeWidth={1.5} />
                    </span>
                    <span className={styles.categoryNumber}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.categoryContent}>
                    <h3 className={styles.categoryTitle}>{disciplineTitle}</h3>
                  </div>
                  <div className={styles.categoryFooter}>
                    <span className={styles.categoryCta}>Meet the team</span>
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

      <CtaBand
        id="cta-title"
        title="Tell us about your project"
        body="Send the location, type of project and your timeline. We will reply with the approvals needed and a scope of work."
        primary={{ href: proposalHref, label: 'Request a proposal' }}
      />
    </>
  )
}
