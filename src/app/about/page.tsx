import { ArrowRight, ArrowUpRight, Building2, Eye, Handshake, Leaf, Pickaxe, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { StatsBand } from '@/components/ui/StatsBand'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import { getProjects, getStats } from '@/content/repository'
import type { Img } from '@/content/types'
import { projectStage } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, ids, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './about.module.css'

const description = `About ${site.name}: Jaipur builders and real estate developers creating modern villas, apartments and plots, and building homes on customers’ own plots.`
const { title } = buildTitle({ name: `About ${site.name}` })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'About', path: routes.about },
]

export const metadata = buildMetadata({ title, description, path: routes.about })

const values = [
  { icon: Eye, title: 'Nothing hidden', body: 'Prices, plans, approvals and progress are shared openly, in writing.' },
  { icon: ShieldCheck, title: 'Built to last', body: 'Sound structure first, then finishes. We don’t cut corners you can’t see.' },
  { icon: Handshake, title: 'One relationship', body: 'The team that sells your home is the team that builds and services it.' },
  { icon: Leaf, title: 'Climate-smart design', body: 'Shade, insulation and ventilation that keep Jaipur summers comfortable.' },
] as const

const disciplines = [
  { icon: Building2, label: 'Infrastructure' },
  { icon: Pickaxe, label: 'Mining' },
  { icon: Leaf, label: 'Environmental Clearance' },
] as const

type Chapter = Readonly<{ eyebrow: string; title: string; body: string; image: Img; extra?: ReactNode }>

const pad = (n: number) => String(n).padStart(2, '0')

export default async function AboutPage() {
  const [stats, projects] = await Promise.all([getStats(), getProjects()])
  const projectPhoto = projects.find((p) => p.gallery[0])?.gallery[0]

  // The company's path in chapters. No dates or figures until the company supplies real ones.
  const chapters: readonly Chapter[] = [
    {
      eyebrow: 'Where it began',
      title: 'A home you can watch being built',
      body: `${site.name} started with a simple idea: a family buying a home in Jaipur deserves to know exactly what they’re getting, and to see it being built.`,
      image: photos.houseModernDay,
    },
    {
      eyebrow: 'The team',
      title: 'Three founders, three disciplines',
      body: 'One founder heads infrastructure, one mining and one environmental clearance. A project is planned, approved and built by people who sit at the same table.',
      image: photos.constructionPlans,
      extra: (
        <ul role="list" className={styles.chips}>
          {disciplines.map(({ icon: Icon, label }) => (
            <li key={label} className={styles.chip}>
              <Icon aria-hidden="true" strokeWidth={1.75} />
              {label}
            </li>
          ))}
        </ul>
      ),
    },
    {
      eyebrow: 'Our own projects',
      title: 'Homes of our own across Jaipur',
      body: 'We develop our own villa communities, apartments and plotted layouts, and share every plan, approval and progress photo along the way.',
      image: projectPhoto ?? photos.apartmentsModern,
      extra:
        projects.length > 0 ? (
          <ul role="list" className={styles.projects}>
            {projects.map((project) => (
              <li key={project.slug}>
                <Link href={routes.project(project.slug)} className={styles.project}>
                  <span className={styles.projectName}>{project.name}</span>
                  <span className={styles.projectStage}>{projectStage(project)}</span>
                  <ArrowUpRight aria-hidden="true" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        ) : undefined,
    },
    {
      eyebrow: 'On your land',
      title: 'Modern homes on your plot',
      body: 'We build modern and modular homes on customers’ own plots, from the drawings and approvals to handing over the keys.',
      image: photos.engineerSite,
      extra: (
        <Link href={routes.construction} className={styles.more}>
          Home construction <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </Link>
      ),
    },
    {
      eyebrow: 'Approvals',
      title: 'Clearances, handled in-house',
      body: 'Our environmental team plans assessments, consents and energy compliance in with the design, and takes on independent infrastructure, industrial and mining clients.',
      image: photos.aravalliLake,
      extra: (
        <Link href={routes.environmentalClearance} className={styles.more}>
          Environmental clearance <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </Link>
      ),
    },
  ]

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.about, name: title, description, type: 'AboutPage', breadcrumb: true, about: ids.organization }),
          breadcrumbNode(routes.about, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        image={photos.jaipurAerial}
        eyebrow="About us"
        title={`About ${site.name}`}
        lead={<p>Jaipur builders and real estate developers. We build modern homes people are proud to live in.</p>}
      />

      {/* The journey: chapters along a gold line that fills as the page scrolls. */}
      <section className={`section ${styles.journey}`} aria-labelledby="journey-title">
        <div className="container">
          <header className={styles.journeyHead}>
            <p className="eyebrow">Our journey</p>
            <h2 id="journey-title" className={styles.journeyTitle}>
              From one simple idea to <span className={styles.accent}>homes across Jaipur</span>
            </h2>
          </header>

          <div className={styles.timeline}>
            <span className={styles.line} aria-hidden="true">
              <span className={styles.lineFill} />
            </span>
            <ol className={styles.chapters}>
              {chapters.map((chapter, i) => (
                <li key={chapter.title} className={styles.chapter}>
                  <span className={styles.marker} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div className={`${styles.media} reveal`}>
                    <Image src={chapter.image.src} alt={chapter.image.alt} fill sizes="(min-width: 64rem) 40vw, 90vw" placeholder="blur" />
                    <span className={styles.ghost} aria-hidden="true">
                      {pad(i + 1)}
                    </span>
                  </div>
                  <div className={`${styles.text} reveal`}>
                    <p className={styles.chapterEyebrow}>{chapter.eyebrow}</p>
                    <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                    <p className={styles.chapterBody}>{chapter.body}</p>
                    {chapter.extra}
                  </div>
                </li>
              ))}
              <li className={`${styles.chapter} ${styles.next}`}>
                <span className={`${styles.marker} ${styles.markerNext}`} aria-hidden="true">
                  <ArrowRight strokeWidth={2} />
                </span>
                <div className={`${styles.nextCard} reveal`}>
                  <p className={styles.nextEyebrow}>The next chapter</p>
                  <h3 className={styles.nextTitle}>Your project</h3>
                  <p className={styles.nextBody}>Tell us what you are planning. We will walk the site with you and put the plan in writing.</p>
                  <div className={styles.nextActions}>
                    <Link href={contactHref('proposal')} className="button button--gold">
                      Start a conversation <ArrowRight aria-hidden="true" strokeWidth={1.75} />
                    </Link>
                    <Link href={routes.projects} className={`button ${styles.nextGhost}`}>
                      See our projects
                    </Link>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="section section--ivory" aria-label="Company figures">
          <div className="container">
            <StatsBand stats={stats} label="Company figures" />
          </div>
        </section>
      )}

      <section className={`section ${styles.values}`} aria-labelledby="values-title">
        <div className="container">
          <header className={styles.valuesHead}>
            <p className={`eyebrow ${styles.valuesEyebrow}`}>How we work</p>
            <h2 id="values-title" className={styles.valuesTitle}>
              Trusted builders in Jaipur, by habit
            </h2>
          </header>
          <ul role="list" className={styles.valueList}>
            {values.map(({ icon: Icon, title: valueTitle, body }, i) => (
              <li key={valueTitle} className={`${styles.value} reveal`}>
                <span className={styles.valueNumber} aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <Icon aria-hidden="true" className={styles.valueIcon} strokeWidth={1.5} />
                <h3 className={styles.valueTitle}>{valueTitle}</h3>
                <p className={styles.valueBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="about-cta"
        title="Come and meet us"
        body="Visit a project or our office. We’ll show you what we’ve built, and what we’re building next."
        primary={{ href: contactHref('site-visit'), label: 'Book a visit' }}
        secondary={{ href: routes.projects, label: 'Our projects' }}
      />
    </>
  )
}
