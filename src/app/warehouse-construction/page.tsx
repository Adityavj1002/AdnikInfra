import { Check, Factory, MapPinned, Phone, Truck, Warehouse } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import type { Faq } from '@/content/types'
import { formatPhone } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { absoluteUrl, breadcrumbNode, faqNode, graph, ids, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './warehouse.module.css'

const description =
  'Warehouse construction in Jaipur: PEB steel and RCC warehouses, godowns and sheds on your land, with land conversion, fire NOC and consents handled.'
const { title } = buildTitle({ name: 'Warehouse Construction in Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Construction', path: routes.construction },
  { name: 'Warehouse construction', path: routes.warehouse },
]

export const metadata = buildMetadata({ title, description, path: routes.warehouse })

const forWhom = [
  {
    icon: MapPinned,
    title: 'Landowners',
    body: `Land on ${site.serviceArea.corridors.slice(0, 3).join(', ')} or another highway? A well-built warehouse turns it into steady rent.`,
  },
  { icon: Factory, title: 'Manufacturers and traders', body: 'Storage sized to your stock, racking and dispatch, close to your plant or market.' },
  { icon: Truck, title: 'Logistics and e-commerce', body: 'Built-to-suit sheds with the height, docks and floor your operation needs.' },
] as const

const builds = [
  { title: 'PEB steel warehouses', body: 'Factory-made steel frames: wide column-free spans, put up in weeks rather than months.' },
  { title: 'RCC and hybrid godowns', body: 'For smaller sheds, upper floors or heavy local loads.' },
  { title: 'Site works', body: 'Boundary wall, truck yard, internal roads, drainage and a site office.' },
  { title: 'Approvals', body: 'Land conversion, building plan, fire NOC and pollution-board consents.' },
] as const

/** What tenants and operations teams check first: the things that decide rent and resale. */
const checklist = [
  'Clear height that suits pallet racking',
  'Column-free spans for easy layout and forklifts',
  'An industrial floor rated for racks and forklifts',
  'Loading docks and room for trucks to turn',
  'Daylight and ventilation through roof sheets and vents',
  'Fire safety designed in for the fire NOC',
] as const

const steps = [
  { title: 'Site visit', body: 'We check the land, access road and soil, and note what you will store.' },
  { title: 'Design and fixed quote', body: 'Layout, structure and an itemised quote with a written timeline.' },
  { title: 'Approvals', body: 'Conversion, plan approval, fire NOC and consents, filed by our team.' },
  { title: 'Build and handover', body: 'Foundations, frame, roof, floor and site works, checked at every stage.' },
] as const

const faqs: readonly Faq[] = [
  {
    question: 'What does warehouse construction cost per sq ft in Jaipur?',
    answer:
      'It depends on the area, clear height, span, floor specification and site works. After a free site visit we send a fixed, itemised quote, so you know the full cost before work starts.',
  },
  {
    question: 'Should I build in PEB steel or RCC?',
    answer:
      'For most warehouses, PEB steel: it is faster to build and gives wide column-free spans. RCC suits smaller godowns, buildings with upper floors and some heavy loads. We recommend one after the site visit.',
  },
  {
    question: 'Can I build a warehouse on agricultural land?',
    answer:
      'Only after the land is converted for industrial or commercial use. We guide you through the conversion and plan the building alongside, so the two are ready together.',
  },
  {
    question: 'Do you handle the fire NOC and pollution-board consents?',
    answer:
      'Yes. Our in-house environmental team prepares the Consent to Establish and Operate where needed, and the design is made to meet fire NOC requirements from the start.',
  },
]

export default function WarehouseConstructionPage() {
  const { phone } = site.contact

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.warehouse, name: title, description, breadcrumb: true, about: ids.builder }),
          breadcrumbNode(routes.warehouse, crumbs),
          {
            '@type': 'Service',
            '@id': `${absoluteUrl(routes.warehouse)}#service`,
            name: 'Warehouse construction in Jaipur',
            serviceType: 'Warehouse and industrial shed construction',
            provider: { '@id': ids.builder },
            areaServed: { '@id': ids.city },
            url: absoluteUrl(routes.warehouse),
          },
          faqNode(routes.warehouse, faqs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        image={photos.warehouse}
        eyebrow="Warehouses and industrial sheds"
        title="Warehouse construction in Jaipur"
        lead={<p>PEB steel and RCC warehouses built on your land: designed for your loads, approved, and ready to use or lease.</p>}
      >
        {phone && (
          <a href={`tel:${phone}`} className="button button--gold">
            <Phone aria-hidden="true" strokeWidth={1.75} />
            Call {formatPhone(phone)}
          </a>
        )}
        <Link href={contactHref('construction', 'warehouse-construction')} className="button button--light">
          Get a free quote
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="for-title">
        <div className="container">
          <SectionHeading id="for-title" eyebrow="Who it’s for" title="A warehouse that earns its keep" />
          <ul role="list" className={blocks.features}>
            {forWhom.map(({ icon: Icon, title: itemTitle, body }) => (
              <li key={itemTitle} className={blocks.feature}>
                <span className={blocks.featureIcon} aria-hidden="true">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className={blocks.featureTitle}>{itemTitle}</h3>
                <p className={blocks.featureBody}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="build-title">
        <div className="container">
          <SectionHeading id="build-title" eyebrow="What we build" title="Steel, RCC and everything around them" />
          <ul role="list" className={styles.builds}>
            {builds.map((item) => (
              <li key={item.title} className={styles.build}>
                <Warehouse aria-hidden="true" className={styles.buildIcon} strokeWidth={1.5} />
                <h3 className={blocks.featureTitle}>{item.title}</h3>
                <p className={blocks.featureBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="check-title">
        <div className={`container ${styles.split}`}>
          <div className={styles.photo}>
            <Image src={photos.warehouse.src} alt={photos.warehouse.alt} fill sizes="(min-width: 64rem) 40vw, 100vw" placeholder="blur" />
          </div>
          <div>
            <SectionHeading
              id="check-title"
              eyebrow="Built to lease"
              title="What tenants look for first"
              intro={<p>These decide the rent a warehouse earns and how fast it finds a tenant. We design for them from day one.</p>}
            />
            <ul role="list" className={blocks.checks}>
              {checklist.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" className="icon" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="steps-title">
        <div className="container">
          <SectionHeading id="steps-title" eyebrow="How it works" title="Four steps, one team" />
          <ol className={`${blocks.steps} ${blocks.stepsGrid}`}>
            {steps.map((step) => (
              <li key={step.title} className={blocks.step}>
                <h3 className={blocks.stepTitle}>{step.title}</h3>
                <p className={blocks.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className={styles.related}>
            Approvals are where most warehouse projects stall. See our{' '}
            <Link href={routes.environmentalClearance}>environmental clearance and consent services</Link>.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className={`container ${styles.faq}`}>
          <SectionHeading id="faq-title" eyebrow="Questions" title="Warehouse construction: FAQs" />
          <FaqList faqs={faqs} />
        </div>
      </section>

      <CtaBand
        id="warehouse-cta"
        title="Tell us about your land"
        body="A free site visit from our engineer, then a fixed quote and a written timeline for your warehouse."
        primary={{ href: contactHref('construction', 'warehouse-construction'), label: 'Get a free quote' }}
        secondary={{ href: routes.construction, label: 'Home construction' }}
      />
    </>
  )
}
