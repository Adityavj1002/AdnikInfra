import type { Faq } from './types'

/**
 * Marketing copy for the service and sector pages. It describes scope only: no client names,
 * counts, certifications or timelines until the company supplies real ones.
 */

export type ServicePage = Readonly<{
  slug: string
  title: string
  /** The page's H1: carries its primary keyword. */
  heading: string
  keyword: string
  metaTitle: string
  metaDescription: string
  serviceType: string
  lead: string
  who: string
  includes: readonly Readonly<{ title: string; body: string }>[]
  steps: readonly Readonly<{ title: string; body: string }>[]
  faqs: readonly Faq[]
}>

export const servicePages: readonly ServicePage[] = [
  {
    slug: 'construction-advisory',
    title: 'Construction Advisory',
    heading: 'Construction advisory services in Jaipur',
    keyword: 'construction advisory services',
    metaTitle: 'Construction Advisory Services in Jaipur',
    metaDescription:
      'Independent construction advice in Jaipur: design review, specifications, costing and contractor selection, so you commit money with the facts in front of you.',
    serviceType: 'Construction consulting',
    lead: 'Technical advice on design review, specifications, costing and contractor selection, before the decisions that are expensive to reverse.',
    who: 'For landowners, developers and institutions planning a building, a campus or an industrial shed who want a second set of technical eyes.',
    includes: [
      { title: 'Design review', body: 'Architectural and structural drawings checked for buildability, coordination gaps and avoidable cost.' },
      { title: 'Specifications', body: 'Materials and finishes written down clearly, so every contractor prices the same building.' },
      { title: 'Cost estimates', body: 'Quantity-based estimates you can compare against bids and use to set a realistic budget.' },
      { title: 'Contractor selection', body: 'Tender documents, bid comparison and a recommendation you can defend.' },
    ],
    steps: [
      { title: 'Share what you have', body: 'Site details, drawings and your budget, however early they are.' },
      { title: 'We review', body: 'We go through the scope and list the risks, gaps and the approvals involved.' },
      { title: 'You decide', body: 'A written report with clear recommendations, and support through tendering if you want it.' },
    ],
    faqs: [
      { question: 'Do you build the project as well?', answer: 'We can advise only, or stay on through project management. The scope is agreed in writing at the start.' },
      { question: 'Can you review drawings another consultant prepared?', answer: 'Yes. An independent review of existing drawings is a common reason clients come to us.' },
    ],
  },
  {
    slug: 'project-management',
    title: 'Project Management',
    heading: 'Project management consultants for construction in Jaipur',
    keyword: 'project management consultants',
    metaTitle: 'Construction Project Management Consultants',
    metaDescription:
      'Construction project management in Jaipur: scheduling, site coordination, quality and cost control from mobilisation to handover, reported against one plan.',
    serviceType: 'Construction project management',
    lead: 'Scheduling, site coordination, quality and cost control from mobilisation to handover.',
    who: 'For owners and developers who need one accountable team between the contractors, the consultants and the budget.',
    includes: [
      { title: 'Programme and scheduling', body: 'A realistic programme, tracked and updated as the work moves.' },
      { title: 'Site coordination', body: 'Contractors, consultants and suppliers kept working to the same drawings and dates.' },
      { title: 'Quality checks', body: 'Stage-wise inspections against the specification, recorded as the work goes up.' },
      { title: 'Cost control', body: 'Bills checked against measured work, with variations flagged before they are spent.' },
    ],
    steps: [
      { title: 'Plan', body: 'We agree scope, programme, budget and how progress will be reported.' },
      { title: 'Run', body: 'Regular site reviews, coordination and reports against the plan.' },
      { title: 'Hand over', body: 'Snag lists, records and closure of the contracts at the end.' },
    ],
    faqs: [
      { question: 'Can you join a project already under way?', answer: 'Yes. We start by auditing progress, cost and pending approvals, then reset the plan from where the project stands.' },
      { question: 'How do you report progress?', answer: 'In a format agreed at the start, against the programme and the budget, so problems are visible early.' },
    ],
  },
  {
    slug: 'real-estate-consultancy',
    title: 'Real Estate Consultancy',
    heading: 'Real estate consultancy in Jaipur',
    keyword: 'real estate consultancy',
    metaTitle: 'Real Estate Consultancy in Jaipur',
    metaDescription:
      'Real estate consultancy in Jaipur: land due diligence, feasibility and approvals support for developers and landowners, before you buy, build or sell.',
    serviceType: 'Real estate consulting',
    lead: 'Land due diligence, feasibility and approvals support for developers and landowners.',
    who: 'For anyone about to buy land, develop a plot or decide what a site is really worth building on.',
    includes: [
      { title: 'Land due diligence', body: 'Title papers, land use and access reviewed with your legal adviser before money changes hands.' },
      { title: 'Feasibility', body: 'What can be built on the site, what it would cost and whether the numbers work.' },
      { title: 'Approvals support', body: 'The permits a project needs, in what order, and help preparing the applications.' },
      { title: 'Selling support', body: 'List a plot, home or building on our marketplace, reviewed by our team before it goes live.' },
    ],
    steps: [
      { title: 'Tell us about the site', body: 'Location, papers you hold and what you hope to do with it.' },
      { title: 'We check', body: 'Land use, access, approvals and the constraints that affect value.' },
      { title: 'You get a clear view', body: 'A plain written summary of the risks and the options.' },
    ],
    faqs: [
      { question: 'Do you give legal title opinions?', answer: 'Formal title opinions come from an advocate. We organise the technical and approvals side and work alongside your legal adviser.' },
      { question: 'Can I sell my property through you?', answer: 'You can list it on our marketplace. Our team reviews every listing before it is published.' },
    ],
  },
  {
    slug: 'infrastructure-development',
    title: 'Infrastructure Development',
    heading: 'Infrastructure development consultants in Jaipur',
    keyword: 'infrastructure development',
    metaTitle: 'Infrastructure Development Consultants',
    metaDescription:
      'Infrastructure development consultants in Jaipur: planning and delivery of buildings, roads, utilities and campuses, with approvals planned in from the start.',
    serviceType: 'Infrastructure consulting',
    lead: 'Planning and delivery of buildings, roads, utilities and campuses.',
    who: 'For institutions, developers and industrial clients planning a campus, a township or the services that connect them.',
    includes: [
      { title: 'Buildings and campuses', body: 'Master planning and coordination of hospitals, institutions, hotels and commercial buildings.' },
      { title: 'Roads and site services', body: 'Internal roads, drainage, water and power planned together, not one after another.' },
      { title: 'Warehouses and townships', body: 'Layouts planned around how the site will actually be used.' },
      { title: 'Approvals alongside', body: 'Environmental and statutory approvals planned in with the design by our in-house team.' },
    ],
    steps: [
      { title: 'Plan', body: 'We review the site and scope, and agree a realistic programme and budget.' },
      { title: 'Comply', body: 'Clearances and consents are prepared before they can hold up the work.' },
      { title: 'Build', body: 'Advisory and project management support on site, tracked against the plan.' },
    ],
    faqs: [
      { question: 'Do you handle environmental clearance too?', answer: 'Yes. Our environmental team works alongside every service, so approvals are planned in with the design.' },
      { question: 'Where do you work?', answer: 'We are based in Jaipur. Tell us the location and we will confirm how we can support the project.' },
    ],
  },
]

export type SectorPage = Readonly<{
  slug: string
  title: string
  heading: string
  keyword: string
  metaTitle: string
  metaDescription: string
  scope: string
  lead: string
  /** Anchor on the Environmental Clearance page. */
  clearanceAnchor: string
  needs: readonly Readonly<{ title: string; body: string }>[]
}>

export const sectorPages: readonly SectorPage[] = [
  {
    slug: 'infrastructure',
    title: 'Infrastructure',
    heading: 'Consultants for infrastructure projects',
    keyword: 'consultants for infrastructure projects',
    metaTitle: 'Consultants for Infrastructure Projects',
    metaDescription:
      'Consultants for hospitals, institutions, hotels, commercial buildings, warehouses, townships, roads and utilities: planning, clearances and project management.',
    scope: 'Hospitals, institutions, hotels, commercial buildings, warehouses, townships, roads and utilities.',
    lead: 'One team for planning, clearances and site support on infrastructure projects.',
    clearanceAnchor: 'infra',
    needs: [
      { title: 'ECBC and ENS compliance', body: 'Envelope, lighting, HVAC and electrical compliance, with simulation-backed energy models.' },
      { title: 'Environmental Clearance', body: 'Applications, supporting studies and replies to appraisal queries for buildings and townships.' },
      { title: 'Project management', body: 'Scheduling, site coordination, quality and cost control from mobilisation to handover.' },
    ],
  },
  {
    slug: 'industrial',
    title: 'Industrial',
    heading: 'Consultants for industrial projects',
    keyword: 'consultants for industrial projects',
    metaTitle: 'Consultants for Industrial Projects',
    metaDescription:
      'Consultants for factories, processing plants, industrial estates and warehousing parks: Environmental Clearance, consents, waste authorisations and audits.',
    scope: 'Factories, processing plants, industrial estates and warehousing parks.',
    lead: 'Approvals and compliance planned in with the plant, not chased at the end.',
    clearanceAnchor: 'industrial',
    needs: [
      { title: 'Environmental Clearance and consents', body: 'EC where the project is listed, and CTE/CTO for every unit by pollution category.' },
      { title: 'Waste authorisations and EPR', body: 'Hazardous waste authorisation and extended producer responsibility registrations.' },
      { title: 'Groundwater NOC and water balance', body: 'Water use assessment, effluent treatment planning and NOC filings.' },
    ],
  },
  {
    slug: 'mining',
    title: 'Mining',
    heading: 'Consultants for mining projects',
    keyword: 'consultants for mining projects',
    metaTitle: 'Consultants for Mining Projects',
    metaDescription:
      'Consultants for major and minor minerals, quarries and sand: mine planning, lease approvals, EIA and EMP reports, closure plans and environmental monitoring.',
    scope: 'Major and minor minerals, quarries and sand: mine planning, lease approvals and closure.',
    lead: 'From the mine plan and lease approvals through to closure and reclamation.',
    clearanceAnchor: 'mining',
    needs: [
      { title: 'EIA and EMP reports', body: 'Baseline data, impact assessment, management plans and public hearing support.' },
      { title: 'Mine closure plans', body: 'Progressive and final closure, reclamation and post-closure monitoring.' },
      { title: 'Environmental monitoring', body: 'Ambient air, water, noise and soil sampling with lab reports.' },
    ],
  },
]
