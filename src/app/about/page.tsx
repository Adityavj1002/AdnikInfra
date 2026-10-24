import { Eye, Handshake, Leaf, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatsBand } from '@/components/ui/StatsBand'
import blocks from '@/components/ui/blocks.module.css'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import { getStats } from '@/content/repository'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, ids, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

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

export default async function AboutPage() {
  const stats = await getStats()
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
        eyebrow="About us"
        title={`About ${site.name}`}
        lead={<p>Jaipur builders and real estate developers. We build modern homes people are proud to live in.</p>}
      />

      <section className="section section--tight" aria-labelledby="story-title">
        <div className="container split">
          <div className="stack">
            <h2 id="story-title" className={blocks.blockTitle}>
              Our story
            </h2>
            <p className={blocks.lead}>
              {site.name} started with a simple idea: a family buying a home in Jaipur deserves to know exactly what
              they’re getting, and to see it being built.
            </p>
            <p className={blocks.lead}>
              Today we develop our own villa communities, apartments and plotted layouts, build modern and modular homes
              on customers’ plots, and help families buy and sell property across the city.
            </p>
          </div>
          <div className={blocks.media}>
            <Image src={photos.houseModernDay.src} alt={photos.houseModernDay.alt} fill sizes="(min-width: 60rem) 45vw, 100vw" placeholder="blur" />
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="section section--dark" aria-label="Company figures">
          <div className="container">
            <StatsBand stats={stats} label="Company figures" />
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="values-title">
        <div className="container">
          <SectionHeading id="values-title" eyebrow="How we work" title="Trusted builders in Jaipur, by habit" align="center" />
          <ul role="list" className={blocks.features}>
            {values.map(({ icon: Icon, title: valueTitle, body }) => (
              <li key={valueTitle} className={blocks.feature}>
                <span className={blocks.featureIcon} aria-hidden="true">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className={blocks.featureTitle}>{valueTitle}</h3>
                <p className={blocks.featureBody}>{body}</p>
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
