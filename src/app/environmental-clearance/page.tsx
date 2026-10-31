import { Check } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
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

const ongoing = [
  'Six-monthly EC compliance reports',
  'Consent renewals',
  'Annual environmental statements',
  'Monitoring and audits',
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
  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.environmentalClearance, name: title, description, breadcrumb: true }),
          breadcrumbNode(routes.environmentalClearance, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        title="Environmental clearance and compliance for infrastructure, industrial and mining projects"
        lead={
          <p>
            One team for the studies, the filings and the follow-up, whether the project is a hospital campus, a
            manufacturing unit or a mining lease.
          </p>
        }
      >
        {tracks.map((track) => (
          <Link key={track.id} href={`#${track.id}`} className="button button--outline button--small">
            {track.name}
          </Link>
        ))}
      </PageHero>

      {/* Three tracks */}
      <section className="section section--tight" aria-labelledby="tracks-title">
        <div className="container">
          <SectionHeading id="tracks-title" title="Services by sector" />
          {tracks.map((track) => (
            <div key={track.id} id={track.id} className={`${blocks.block} ${styles.track}`}>
              <div className={styles.trackHead}>
                <h3 className={blocks.blockTitle}>{track.name}</h3>
                <p className={blocks.lead}>{track.scope}</p>
              </div>
              <ul role="list" className={blocks.features}>
                {track.services.map((service) => (
                  <li key={service.title} className={blocks.feature}>
                    <h4 className={blocks.featureTitle}>{service.title}</h4>
                    <p className={blocks.featureBody}>{service.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Ongoing compliance */}
      <section className="section section--ivory" aria-labelledby="ongoing-title">
        <div className="container split">
          <div className="stack">
            <h2 id="ongoing-title" className={blocks.blockTitle}>
              After the approval, we stay on
            </h2>
            <p className={blocks.lead}>
              Clearances come with conditions. We prepare your periodic compliance reports, consent renewals and annual
              returns so nothing lapses.
            </p>
          </div>
          <ul role="list" className={blocks.checks}>
            {ongoing.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" className="icon" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deliverables */}
      <section className="section" aria-labelledby="deliverables-title">
        <div className="container">
          <SectionHeading id="deliverables-title" title="What you receive" />
          <ul role="list" className={blocks.features}>
            {deliverables.map((item) => (
              <li key={item.title} className={blocks.feature}>
                <h3 className={blocks.featureTitle}>{item.title}</h3>
                <p className={blocks.featureBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tools */}
      <section className="section section--raised" aria-labelledby="tools-title">
        <div className="container">
          <SectionHeading
            id="tools-title"
            title="Tools and standards we work with"
            intro={<p>Energy modelling and drawing software, and the national codes your project is assessed against.</p>}
          />
          <ul role="list" className={styles.tools}>
            {tools.map((tool) => (
              <li key={tool} className="badge">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="enquiry"
        title="Not sure which approvals you need?"
        body="Share your project type and location and we will list the clearances that apply."
        primary={{ href: contactHref('other', 'environmental-clearance'), label: 'Ask our consultants' }}
      />
    </>
  )
}
