import { Blocks, Check, ClipboardCheck, DraftingCompass, Hammer, House, PaintRoller, Timer } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { photos } from '@/content/images'
import { getPackages } from '@/content/repository'
import type { Faq } from '@/content/types'
import { CostEstimator } from '@/features/calculators/CostEstimator'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, constructionServiceNode, faqNode, graph, ids, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './construction.module.css'

const description =
  'Home construction company in Jaipur: modern and modular houses built on your plot, with design, approvals and handover. See cost per sq ft and estimate yours.'
const { title } = buildTitle({ name: 'Home Construction Company in Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Construction', path: routes.construction },
]

export const metadata = buildMetadata({ title, description, path: routes.construction })

const services = [
  { icon: House, title: 'Turnkey house construction', body: 'From soil test to keys: one team, one contract, one point of contact.' },
  { icon: Blocks, title: 'Modular & prefab-assisted homes', body: 'Factory-made panels, stairs and units for a faster, cleaner build.' },
  { icon: Hammer, title: 'Renovation & extensions', body: 'Add a floor, rework a layout, or modernise an older house.' },
  { icon: PaintRoller, title: 'Interiors', body: 'Modular kitchens, wardrobes, false ceilings and lighting, built in.' },
] as const

const process = [
  { title: 'Free site visit', body: 'We inspect your plot, check access and soil, and understand what you want.' },
  { title: 'Design & 3D elevation', body: 'Floor plans, structural design and a 3D view you approve before we build.' },
  { title: 'Fixed quote & agreement', body: 'A written specification, rate and timeline, with stage-wise payments.' },
  { title: 'Approvals', body: 'We prepare drawings and handle building-plan approval paperwork.' },
  { title: 'Construction', body: 'Our own site team, branded materials and quality checks at each stage.' },
  { title: 'Handover', body: 'Final inspection, as-built drawings, warranty papers and your keys.' },
] as const

const payments = [
  { stage: 'Booking & design', share: 10 },
  { stage: 'Foundation & plinth', share: 15 },
  { stage: 'Frame & slabs', share: 30 },
  { stage: 'Masonry & plaster', share: 20 },
  { stage: 'Flooring, fittings & finishes', share: 20 },
  { stage: 'Handover', share: 5 },
] as const

const faqs: readonly Faq[] = [
  {
    question: 'What is the construction cost per sq ft in Jaipur?',
    answer:
      'It depends mainly on the finish level. Our packages start at an indicative ₹1,650 per sq ft of built-up area for a standard finish, and go up for premium and luxury specifications. Approvals, boundary walls and loose interiors are quoted separately.',
  },
  {
    question: 'How long does it take to build a house?',
    answer:
      'A typical G+1 home takes 10 to 15 months from approval to handover. Modular and prefab-assisted methods can shorten the on-site schedule by several weeks.',
  },
  {
    question: 'Do you help with building-plan approval?',
    answer: 'Yes. We prepare the drawings and documents and handle the approval process with the authority on your behalf.',
  },
  {
    question: 'Can I see my home being built?',
    answer: 'Always. You get weekly photos, a monthly report, and you are welcome on site at any stage with our engineer.',
  },
]

export default async function ConstructionPage() {
  const packages = await getPackages()

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.construction, name: title, description, breadcrumb: true, about: ids.builder }),
          breadcrumbNode(routes.construction, crumbs),
          constructionServiceNode(packages),
          faqNode(routes.construction, faqs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        image={photos.engineerSite}
        eyebrow="Build on your plot"
        title="Home construction company in Jaipur"
        lead={<p>Modern and modular homes designed and built on your own land, at a fixed rate per sq ft.</p>}
      >
        <Link href="#estimate" className="button button--gold">
          Estimate your cost
        </Link>
        <Link href={contactHref('construction')} className="button button--light">
          Book a free site visit
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <SectionHeading id="services-title" eyebrow="What we build" title="One team, from plan to keys" />
          <ul role="list" className={blocks.features}>
            {services.map(({ icon: Icon, title: serviceTitle, body }) => (
              <li key={serviceTitle} className={blocks.feature}>
                <span className={blocks.featureIcon} aria-hidden="true">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className={blocks.featureTitle}>{serviceTitle}</h3>
                <p className={blocks.featureBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="packages-title">
        <div className="container">
          <SectionHeading
            id="packages-title"
            eyebrow="Packages"
            title="House construction cost per sq ft"
            intro={<p>Indicative rates for built-up area. Your exact quote follows a site visit.</p>}
          />
          <ul role="list" className={styles.packages}>
            {packages.map((pkg) => (
              <li key={pkg.slug} className={`${styles.package} ${pkg.slug === 'premium' ? styles.featured : ''}`}>
                {pkg.slug === 'premium' && <span className={`badge badge--gold ${styles.popular}`}>Most chosen</span>}
                <h3 className={styles.packageName}>{pkg.name}</h3>
                <p className={styles.packageRate}>
                  <span className="nums">₹{pkg.ratePerSqft.toLocaleString('en-IN')}</span>
                  <span className={styles.per}>/ sq ft</span>
                </p>
                <p className={blocks.note}>{pkg.summary}</p>
                <ul role="list" className={blocks.checks}>
                  {pkg.inclusions.map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" className="icon" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={contactHref('construction')} className={`button ${pkg.slug === 'premium' ? 'button--gold' : 'button--outline'} ${styles.packageCta}`}>
                  Get a quote
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="estimate" className="section" aria-labelledby="estimate-title">
        <div className="container">
          <SectionHeading
            id="estimate-title"
            eyebrow="Cost estimator"
            title="Estimate your construction cost"
            intro={<p>Change the area, floors and package to see an instant, indicative estimate.</p>}
          />
          <CostEstimator packages={packages} />
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="process-title">
        <div className="container split split--wide-start">
          <div>
            <SectionHeading id="process-title" eyebrow="How it works" title="Six clear steps" />
            <ol className={`${blocks.steps}`}>
              {process.map((step) => (
                <li key={step.title} className={blocks.step}>
                  <h3 className={blocks.stepTitle}>{step.title}</h3>
                  <p className={blocks.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="stack">
            <div className={blocks.media}>
              <Image src={photos.floorPlan.src} alt={photos.floorPlan.alt} fill sizes="(min-width: 60rem) 40vw, 100vw" placeholder="blur" />
            </div>
            <div className={blocks.panel}>
              <h3 className={blocks.panelTitle}>Stage-wise payments</h3>
              <p className={blocks.note}>You pay as the work is done, never far ahead of it.</p>
              <ol className={styles.payments}>
                {payments.map((payment) => (
                  <li key={payment.stage}>
                    <span>{payment.stage}</span>
                    <strong className="nums">{payment.share}%</strong>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="quality-title">
        <div className="container">
          <SectionHeading id="quality-title" eyebrow="Quality" title="Checked at every stage" align="center" />
          <ul role="list" className={blocks.features}>
            {[
              { icon: ClipboardCheck, title: 'Stage-wise quality checks', body: 'From reinforcement spacing to plaster thickness, signed off by our engineer.' },
              { icon: DraftingCompass, title: 'Structural design', body: 'Earthquake-resistant RCC design by a qualified structural engineer.' },
              { icon: Timer, title: 'Schedule you can see', body: 'A shared timeline, weekly photos and a monthly report.' },
            ].map(({ icon: Icon, title: qTitle, body }) => (
              <li key={qTitle} className={blocks.feature}>
                <span className={blocks.featureIcon} aria-hidden="true">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className={blocks.featureTitle}>{qTitle}</h3>
                <p className={blocks.featureBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="faq-title">
        <div className={`container ${styles.faq}`}>
          <SectionHeading id="faq-title" eyebrow="Questions" title="House construction in Jaipur: FAQs" />
          <FaqList faqs={faqs} />
        </div>
      </section>

      <CtaBand
        id="construction-cta"
        title="Let’s look at your plot"
        body="A free visit from our engineer: we check the site, talk through your plans and send a written estimate."
        primary={{ href: contactHref('construction'), label: 'Book a free site visit' }}
        secondary={{ href: routes.projects, label: 'See our projects' }}
      />
    </>
  )
}
