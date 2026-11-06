import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Factory,
  FileText,
  Leaf,
  Mountain,
  Phone,
  Pickaxe,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TileGrid, type Tile } from '@/components/ui/TileGrid'
import { site } from '@/config/site'
import { clearanceFaqs } from '@/content/consultancy'
import { photos } from '@/content/images'
import { formatPhone } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, faqNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './environmental.module.css'

const description =
  'Environmental clearance and compliance for infrastructure, industrial and mining projects: EIA, consents, ECBC and ENS reports, closure plans and monitoring.'
const { title } = buildTitle({ name: 'Environmental Clearance & Compliance' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Environmental Clearance', path: routes.environmentalClearance },
]

export const metadata = buildMetadata({ title, description, path: routes.environmentalClearance })

// Copy is word for word from the client's brief (Company Website Preview).
const tracks = [
  {
    id: 'infra',
    name: 'Infrastructure',
    icon: Building2,
    scope: 'Hospitals, institutions, hotels, commercial buildings, warehouses, townships, roads and utilities.',
    services: [
      {
        title: 'ECBC and ENS compliance reports',
        body: 'Envelope, lighting, HVAC and electrical compliance, with simulation-backed energy models.',
      },
      {
        title: 'Environmental Clearance for buildings and townships',
        body: 'Applications, supporting studies and replies to appraisal queries.',
      },
      {
        title: 'Consent to Establish and Operate',
        body: 'State Pollution Control Board applications, renewals and compliance returns.',
      },
      {
        title: 'Green building rating support',
        body: 'GRIHA and similar ratings, from pre-design checklists to documentation.',
      },
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial',
    icon: Factory,
    scope: 'Manufacturing units, processing plants and industrial estates.',
    services: [
      {
        title: 'Environmental Clearance and consents',
        body: 'EC where the project is listed, and CTE/CTO for every unit by pollution category.',
      },
      {
        title: 'Waste authorisations and EPR',
        body: 'Hazardous waste authorisation and extended producer responsibility registrations.',
      },
      {
        title: 'Groundwater NOC and water balance',
        body: 'Water use assessment, effluent treatment planning and NOC filings.',
      },
      {
        title: 'Environmental audits and compliance',
        body: 'Stack and effluent compliance checks, statutory audits and annual returns.',
      },
    ],
  },
  {
    id: 'mining',
    name: 'Mining',
    icon: Mountain,
    scope: 'Major and minor minerals, quarries and sand.',
    services: [
      {
        title: 'EIA and EMP reports',
        body: 'Baseline data, impact assessment, management plans and public hearing support.',
      },
      { title: 'Mine closure plans', body: 'Progressive and final closure, reclamation and post-closure monitoring.' },
      {
        title: 'Consents and statutory returns',
        body: 'Pollution Control Board consents and periodic compliance reporting.',
      },
      { title: 'Environmental monitoring', body: 'Ambient air, water, noise and soil sampling with lab reports.' },
    ],
  },
] as const

const sectors: readonly Tile[] = [
  {
    href: routes.sector('infrastructure'),
    icon: Building2,
    title: 'Infrastructure',
    body: 'Hospitals, institutions, hotels, commercial buildings, warehouses, townships, roads and utilities.',
    cta: 'See what we do',
  },
  {
    href: routes.sector('industrial'),
    icon: Factory,
    title: 'Industrial',
    body: 'Factories, processing plants, industrial estates and warehousing parks.',
    cta: 'See what we do',
  },
  {
    href: routes.sector('mining'),
    icon: Pickaxe,
    title: 'Mining',
    body: 'Major and minor minerals, quarries and sand: mine planning, lease approvals and closure.',
    cta: 'See what we do',
  },
]

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

/** Facts drawn from the services below, not marketing figures. */
const glance = [
  { value: '3', label: 'Sectors', detail: 'Infrastructure, industrial and mining' },
  { value: '12', label: 'Services', detail: 'Studies, filings, audits and monitoring' },
  { value: 'A to Z', label: 'Coverage', detail: 'From screening to post-approval compliance' },
  { value: 'RJ', label: 'Rajasthan focus', detail: 'SEIAA, RSPCB and CGWA filings' },
] as const

/** The stages of the EIA Notification, 2006. Which ones apply depends on the project's category. */
const stages = [
  { title: 'Screening', body: 'We place the project in Category A (MoEFCC) or B (SEIAA) and list every other permit it needs.' },
  { title: 'Terms of Reference', body: 'The expert committee sets what the study must cover. Building and township projects skip this stage.' },
  { title: 'Baseline study and EIA', body: 'Air, water, noise and soil data for a season, then the impact assessment and management plan.' },
  { title: 'Public consultation', body: 'A public hearing held by the Pollution Control Board, where the category calls for one.' },
  { title: 'Appraisal', body: 'We present to the Expert Appraisal Committee and answer its queries until it recommends the project.' },
  { title: 'Clearance and compliance', body: 'The EC is granted with conditions; we keep the project compliant for its life.' },
] as const

const authorities = [
  { permit: 'Environmental Clearance', body: 'MoEFCC for Category A projects, SEIAA Rajasthan for Category B.' },
  { permit: 'Consent to Establish and Operate', body: 'Rajasthan State Pollution Control Board (RSPCB).' },
  { permit: 'Groundwater NOC', body: 'Central Ground Water Authority (CGWA).' },
  { permit: 'Hazardous waste authorisation', body: 'RSPCB, under the Hazardous and Other Wastes Rules, 2016.' },
  { permit: 'EPR registration', body: 'Central Pollution Control Board (CPCB).' },
  { permit: 'Mine closure plan', body: 'Indian Bureau of Mines for major minerals; the state mines department for minor minerals.' },
] as const

const ongoing = [
  { title: 'Six-monthly EC compliance reports', when: 'Every six months' },
  { title: 'Consent renewals', when: 'Before expiry' },
  { title: 'Annual environmental statements', when: 'Every year' },
  { title: 'Monitoring and audits', when: 'Ongoing' },
] as const

const deliverables = [
  {
    title: 'A filing-ready report',
    body: 'Formatted for the authority concerned, with drawings, calculations and annexures.',
  },
  {
    title: 'A clear approval path',
    body: 'Which permits you need, in what order and how long each is expected to take.',
  },
  { title: 'Follow-up until closure', body: 'We respond to queries and revisions until the approval is issued.' },
] as const

const tools = ['DesignBuilder', 'EnergyPlus', 'eQUEST', 'BEE ECBC-R tool', 'AutoCAD', 'ECBC', 'ENS', 'GRIHA'] as const

export default function EnvironmentalClearancePage() {
  const { phone } = site.contact
  const enquiry = contactHref('proposal', 'environmental-clearance')

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.environmentalClearance, name: title, description, breadcrumb: true }),
          breadcrumbNode(routes.environmentalClearance, crumbs),
          faqNode(routes.environmentalClearance, clearanceFaqs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        image={photos.aravalliLake}
        eyebrow="Environmental consultancy"
        title="Environmental clearance and compliance for infrastructure, industrial and mining projects"
        lead={
          <p>
            One team for the studies, the filings and the follow-up, whether the project is a hospital campus, a
            manufacturing unit or a mining lease.
          </p>
        }
      >
        <Link href={enquiry} className="button button--gold">
          Ask our consultants
        </Link>
        {phone && (
          <a href={`tel:${phone}`} className="button button--light">
            <Phone aria-hidden="true" strokeWidth={1.75} />
            Call {formatPhone(phone)}
          </a>
        )}
      </PageHero>

      <section className={styles.glance} aria-label="At a glance">
        <div className="container">
          <ul role="list" className={styles.glanceList}>
            {glance.map((item) => (
              <li key={item.label} className={styles.glanceItem}>
                <span className={styles.glanceValue}>{item.value}</span>
                <span className={styles.glanceLabel}>{item.label}</span>
                <span className={styles.glanceDetail}>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="sectors" className="section section--raised" aria-labelledby="sectors-title">
        <div className="container">
          <SectionHeading id="sectors-title" eyebrow="Sectors we serve" title="Infrastructure, industrial and mining" />
          <TileGrid tiles={sectors} />
        </div>
      </section>

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
            <div className={styles.promiseActions}>
              <a href="#services" className="button button--gold">
                See all clearance services <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </a>
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

      <section id="services" className="section" aria-labelledby="tracks-title">
        <div className="container">
          <SectionHeading
            id="tracks-title"
            eyebrow="What we do"
            title="Services by sector"
            intro={<p>Pick your sector to see the approvals and reports we prepare for it.</p>}
          />
          <nav aria-label="Sectors" className={styles.sectorNav}>
            {tracks.map(({ id, name, icon: Icon }) => (
              <a key={id} href={`#${id}`} className={styles.sectorLink}>
                <Icon aria-hidden="true" strokeWidth={1.75} />
                {name}
              </a>
            ))}
          </nav>
          <div className={styles.tracks}>
            {tracks.map(({ id, name, scope, services, icon: Icon }) => (
              <article key={id} id={id} className={styles.track} aria-labelledby={`${id}-title`}>
                <div className={styles.trackHead}>
                  <span className={styles.trackIcon} aria-hidden="true">
                    <Icon strokeWidth={1.5} />
                  </span>
                  <h3 id={`${id}-title`} className={styles.trackTitle}>
                    {name}
                  </h3>
                  <p className={styles.trackScope}>{scope}</p>
                </div>
                <ul role="list" className={styles.services}>
                  {services.map((service) => (
                    <li key={service.title} className={styles.service}>
                      <Check aria-hidden="true" className={styles.serviceIcon} strokeWidth={2} />
                      <div>
                        <h4 className={styles.serviceTitle}>{service.title}</h4>
                        <p className={styles.serviceBody}>{service.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.processSection}`} aria-labelledby="process-title">
        <div className="container">
          <header className={styles.darkHead}>
            <p className={`eyebrow ${styles.darkEyebrow}`}>How it works</p>
            <h2 id="process-title" className={styles.darkTitle}>
              The road to an environmental clearance
            </h2>
            <p className={styles.darkIntro}>
              Six stages under the EIA Notification, 2006. We tell you on day one which of them your project goes
              through, and we handle each one.
            </p>
          </header>
          <ol className={styles.process}>
            {stages.map((step, i) => (
              <li key={step.title} className={styles.processStep}>
                <span className={styles.processNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.processTitle}>{step.title}</h3>
                <p className={styles.processBody}>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className={styles.processNote}>
            Building and construction projects are appraised on Form 1, Form 1A and a conceptual plan, without a
            public hearing.
          </p>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="authorities-title">
        <div className="container">
          <SectionHeading
            id="authorities-title"
            eyebrow="Who approves what"
            title="Every permit, and the authority that issues it"
            intro={<p>Most projects need more than one. We file them in the right order so none holds up another.</p>}
          />
          <ul role="list" className={styles.authorities}>
            {authorities.map((item) => (
              <li key={item.permit} className={styles.authority}>
                <h3 className={styles.authorityPermit}>{item.permit}</h3>
                <p className={styles.authorityBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--ivory" aria-labelledby="ongoing-title">
        <div className={`container ${styles.ongoingWrap}`}>
          <div className={styles.ongoingText}>
            <p className="eyebrow">After the approval</p>
            <h2 id="ongoing-title" className={styles.ongoingTitle}>
              After the approval, we stay on
            </h2>
            <p className={styles.ongoingLead}>
              Clearances come with conditions. We prepare your periodic compliance reports, consent renewals and annual
              returns so nothing lapses.
            </p>
          </div>
          <ul role="list" className={styles.calendar}>
            {ongoing.map((item) => (
              <li key={item.title} className={styles.calendarItem}>
                <span className={styles.calendarWhen}>{item.when}</span>
                <span className={styles.calendarTitle}>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="deliverables-title">
        <div className="container">
          <SectionHeading id="deliverables-title" eyebrow="Deliverables" title="What you receive" />
          <ol className={styles.deliverables}>
            {deliverables.map((item, i) => (
              <li key={item.title} className={styles.deliverable}>
                <span className={styles.deliverableNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.deliverableTitle}>{item.title}</h3>
                <p className={styles.deliverableBody}>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--raised" aria-labelledby="tools-title">
        <div className="container">
          <SectionHeading
            id="tools-title"
            eyebrow="Expertise"
            title="Tools and standards we work with"
            intro={<p>Energy modelling and drawing software, and the national codes your project is assessed against.</p>}
          />
          <ul role="list" className={styles.tools}>
            {tools.map((tool) => (
              <li key={tool} className={styles.tool}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className={`container ${styles.faq}`}>
          <SectionHeading id="faq-title" eyebrow="Questions" title="Environmental clearance in Rajasthan: common questions" />
          <FaqList faqs={clearanceFaqs} />
          <p className={styles.faqMore}>
            Have a question about your project?{' '}
            <Link href={enquiry}>
              Ask our consultants <ArrowRight aria-hidden="true" className="icon" strokeWidth={1.75} />
            </Link>
          </p>
        </div>
      </section>

      <CtaBand
        id="enquiry"
        title="Not sure which approvals you need?"
        body="Share your project type and location and we will list the clearances that apply."
        primary={{ href: enquiry, label: 'Ask our consultants' }}
      />
    </>
  )
}
