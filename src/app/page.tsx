import { ArrowRight, ArrowUpRight, Building2, Leaf, MapPin, MessageCircle, Phone, Pickaxe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectCard } from '@/components/ui/Cards'
import { CtaBand } from '@/components/ui/CtaBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TileGrid } from '@/components/ui/TileGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { FaqList } from '@/components/ui/FaqList'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import { getLocalities, getProjects, getStats } from '@/content/repository'
import { homeFaqs } from '@/content/consultancy'
import { services } from '@/content/services'
import { NO_FEATURED, featuredProjectSlug } from '@/features/projects/featured'
import { ProjectShowcase, type Slide } from '@/features/projects/ProjectShowcase'
import { formatPhone, projectStage, projectTypeLabel } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { faqNode, graph, webPageNode } from '@/seo/schema'
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
  'real-estate-consultancy': RealEstateIcon,
  'infrastructure-development': RoadsIcon,
}

/** Where an enquiry with no particular service in mind goes: the proposal request. */
const proposalHref = contactHref('proposal')

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
  const [projects, localities, stats, chosen] = await Promise.all([getProjects(), getLocalities(), getStats(), featuredProjectSlug()])
  const localityOf = (slug: string) => localities.find((l) => l.slug === slug)
  // An admin's choice (Admin → Projects) wins, including "none"; otherwise the first project.
  // A project without a photo is never featured: the layout is built on one.
  const candidate = chosen === NO_FEATURED ? undefined : (projects.find((p) => p.slug === chosen) ?? projects[0])
  const spotlight = candidate && candidate.gallery.length > 0 ? candidate : undefined
  const spotlightLocality = spotlight ? localityOf(spotlight.localitySlug) : undefined
  // The slideshow needs a photo per project; the featured project leads.
  const slides: Slide[] = [...(spotlight ? [spotlight] : []), ...projects.filter((p) => p !== spotlight)].flatMap((project) => {
    const image = project.gallery[0]
    if (!image) return []
    const locality = localityOf(project.localitySlug)
    return [
      {
        slug: project.slug,
        href: routes.project(project.slug),
        name: project.name,
        kind: projectTypeLabel[project.type],
        stage: projectStage(project),
        place: locality ? `${locality.name}, ${site.city}` : undefined,
        summary: project.summary,
        homes: project.configurations.map((c) => c.label),
        image,
      },
    ]
  })
  const { phone, whatsapp } = site.contact

  return (
    <>
      <JsonLd graph={graph(webPageNode({ path: routes.home, name: title, description }), faqNode(routes.home, homeFaqs))} />

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
              <Link href={projects.length > 0 ? '#projects' : routes.projects} className={`button ${styles.glassButton}`}>
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
                <span className={styles.heroCardKicker}>Featured · {projectStage(spotlight)}</span>
                <span className={styles.heroCardTitle}>{spotlight.name}</span>
                {spotlightLocality && (
                  <span className={styles.heroCardMeta}>
                    <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {spotlightLocality.name}, {site.city}
                  </span>
                )}
                <span className={styles.heroCardTagline}>{spotlight.tagline}</span>
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

      {/* Projects: every project as a full-width slide, the featured one first. */}
      {slides.length > 0 ? (
        <ProjectShowcase slides={slides} title="Homes we are building in Jaipur" allHref={routes.projects} />
      ) : (
        projects.length > 0 && (
          <section id="projects" className="section section--raised" aria-labelledby="projects-title">
            <div className="container">
              <SectionHeading id="projects-title" eyebrow="Projects" title="Homes we are building in Jaipur" />
              <div className="grid-cards">
                {projects.map((project) => (
                  <ProjectCard key={project.slug} item={project} locality={localityOf(project.localitySlug)} />
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* Services */}
      <section id="services" className="section" aria-labelledby="categories-title">
        <div className="container">
          <SectionHeading
            id="categories-title"
            eyebrow="What we do"
            title={
              <>
                Everything your project needs, <span className={styles.accent}>under one roof</span>
              </>
            }
            intro={<p>Advice, approvals, land and delivery, from one team that answers for all of it.</p>}
          />
          <TileGrid
            tiles={services.map((service) => ({
              href: service.href,
              icon: serviceIcons[service.slug] ?? BuildingIcon,
              title: service.title,
              body: service.body,
              cta: service.cta ?? 'Explore Service',
              number: service.number,
              highlight: service.highlight,
            }))}
          />
        </div>
      </section>

      {/* How we work: the four stages stacked in CSS 3D, layer by layer, beside the steps */}
      <section className="section section--ivory" aria-labelledby="process-title">
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

      {/* About: one founder per discipline */}
      <section id="team" className="section" aria-labelledby="team-title">
        <div className="container">
          <SectionHeading
            id="team-title"
            eyebrow="About us"
            title="Three founders, three disciplines"
          />
          <TileGrid tiles={disciplines.map(({ icon, title: disciplineTitle }) => ({ href: routes.about, icon, title: disciplineTitle, cta: 'Meet the team' }))} />
        </div>
      </section>

      {/* Questions people search for, answered in plain words (FAQPage data above). */}
      <section id="faq" className="section section--raised" aria-labelledby="faq-title">
        <div className={`container ${styles.faq}`}>
          <div className={styles.faqAside}>
            <SectionHeading
              id="faq-title"
              eyebrow="Questions"
              title="Infrastructure, clearance and construction consultants in Jaipur"
              intro={<p>What clients ask us most before a project starts.</p>}
            />
            <div className={styles.faqHelp}>
              <p className={styles.faqHelpTitle}>Still have a question?</p>
              <p className={styles.faqHelpBody}>Talk to the team directly. We usually reply the same working day.</p>
              <div className={styles.faqHelpActions}>
                {phone && (
                  <a href={`tel:${phone}`} className="button button--gold">
                    <Phone aria-hidden="true" strokeWidth={1.75} />
                    {formatPhone(phone)}
                  </a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} className={`button ${styles.faqHelpLink}`}>
                    <MessageCircle aria-hidden="true" strokeWidth={1.75} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
          <FaqList faqs={homeFaqs} />
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
