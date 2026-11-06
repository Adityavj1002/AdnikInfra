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
  /** Supporting search phrases the copy is written to answer; never emitted as meta keywords. */
  supporting: readonly string[]
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
      'Construction advice and project management in Jaipur: design review, costing, contractor selection, then scheduling, quality and cost control to handover.',
    serviceType: 'Construction consulting and project management',
    supporting: [
      'construction consultant in Jaipur',
      'construction advisory services Jaipur',
      'building design review',
      'construction cost estimate Jaipur',
      'contractor selection and tendering',
      'project management consultants Jaipur',
      'PMC services Jaipur',
      'site supervision and quality control',
    ],
    lead: 'Technical advice on design review, specifications, costing and contractor selection, then project management on site from mobilisation to handover.',
    who: 'For landowners, developers and institutions planning a building, a campus or an industrial shed who want a second set of technical eyes, and one accountable team on site once work begins.',
    includes: [
      { title: 'Design review', body: 'Architectural and structural drawings checked for buildability, coordination gaps and avoidable cost.' },
      { title: 'Specifications', body: 'Materials and finishes written down clearly, so every contractor prices the same building.' },
      { title: 'Cost estimates', body: 'Quantity-based estimates you can compare against bids and use to set a realistic budget.' },
      { title: 'Contractor selection', body: 'Tender documents, bid comparison and a recommendation you can defend.' },
      { title: 'Programme and scheduling', body: 'A realistic programme, tracked and updated as the work moves.' },
      { title: 'Site coordination', body: 'Contractors, consultants and suppliers kept working to the same drawings and dates.' },
      { title: 'Quality checks', body: 'Stage-wise inspections against the specification, recorded as the work goes up.' },
      { title: 'Cost control', body: 'Bills checked against measured work, with variations flagged before they are spent.' },
    ],
    steps: [
      { title: 'Share what you have', body: 'Site details, drawings and your budget, however early they are.' },
      { title: 'We review', body: 'We go through the scope and list the risks, gaps and the approvals involved.' },
      { title: 'You decide', body: 'A written report with clear recommendations, and support through tendering if you want it.' },
      { title: 'We manage the build', body: 'If you want us on site: regular reviews, coordination and reports against the plan, through to handover.' },
    ],
    faqs: [
      {
        question: 'Do you build the project as well?',
        answer: 'We can advise only, or stay on to manage the build through to handover. The scope is agreed in writing at the start.',
      },
      { question: 'Can you review drawings another consultant prepared?', answer: 'Yes. An independent review of existing drawings is a common reason clients come to us.' },
      {
        question: 'What does a construction consultant in Jaipur do?',
        answer: 'A construction consultant reviews the design, writes the specifications, estimates the cost and helps you choose a contractor, so you build what you planned at the price you planned.',
      },
      {
        question: 'What does a project management consultant (PMC) do?',
        answer: 'A PMC plans the programme, coordinates the contractors and consultants on site, checks quality at each stage and controls cost, from mobilisation to handover.',
      },
      { question: 'Can you join a project already under way?', answer: 'Yes. We start by auditing progress, cost and pending approvals, then reset the plan from where the project stands.' },
      { question: 'How do you report progress?', answer: 'In a format agreed at the start, against the programme and the budget, so problems are visible early.' },
      {
        question: 'How are your fees worked out?',
        answer: 'On the scope of work. We review your project first, then quote a fixed scope in writing before any work starts.',
      },
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
    supporting: [
      'real estate consultant in Jaipur',
      'land due diligence Jaipur',
      'property feasibility study',
      'land use and approvals Rajasthan',
      'real estate advisory Rajasthan',
      'sell property in Jaipur',
    ],
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
      {
        question: 'What should I check before buying land in Jaipur?',
        answer: 'The title papers, the land use, road access, the approvals the site needs and what you can actually build on it. We check the technical and approvals side alongside your legal adviser.',
      },
      {
        question: 'Do you sell flats in Jaipur?',
        answer: 'Yes. Liv Prime, our own project on Ram Nagariya Road near SKIT College, Jagatpura, offers 2 and 3 BHK apartments and penthouses.',
      },
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
    supporting: [
      'infrastructure consultants in Jaipur',
      'infrastructure development company Rajasthan',
      'township and campus planning',
      'roads, drainage and utilities planning',
      'warehouse and industrial park development',
      'infrastructure project consultant India',
    ],
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
      {
        question: 'What kinds of infrastructure projects do you support?',
        answer: 'Hospitals, institutions, hotels, commercial buildings, warehouses, townships, internal roads and site utilities, with the environmental approvals planned in from the start.',
      },
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

/** Questions people search for before hiring us; on the home page with FAQPage data. */
export const homeFaqs: readonly Faq[] = [
  {
    question: 'What does an infrastructure consultant in Jaipur do?',
    answer:
      'Adnik Infra plans, approves and delivers building and infrastructure projects: construction advisory, environmental clearance, project management, real estate consultancy and infrastructure development, for clients in Jaipur and across Rajasthan.',
  },
  {
    question: 'Do you help with environmental clearance in Rajasthan?',
    answer:
      'Yes. We prepare EIA and EMP reports, Environmental Clearance applications for buildings, townships, industrial units and mines, Consent to Establish and Operate applications to the State Pollution Control Board, and the compliance reports that follow the approval.',
  },
  {
    question: 'Which projects need Consent to Establish (CTE) and Consent to Operate (CTO)?',
    answer:
      'Most industrial units, and many large buildings, need consent from the State Pollution Control Board under the Water and Air Acts: CTE before construction and CTO before operation. The pollution category of the unit decides the process. We confirm which consents apply to your project.',
  },
  {
    question: 'Do you prepare ECBC and ENS compliance reports?',
    answer:
      'Yes. We prepare Energy Conservation Building Code (ECBC) reports for commercial buildings and Eco Niwas Samhita (ENS) reports for residential buildings, with simulation-backed energy models.',
  },
  {
    question: 'Can you manage a construction project from start to handover?',
    answer:
      'Yes. Our project management service covers scheduling, site coordination, stage-wise quality checks and cost control, from mobilisation to handover.',
  },
  {
    question: 'Do you have flats for sale in Jaipur?',
    answer:
      'Yes. Liv Prime, on Ram Nagariya Road near SKIT College in Jagatpura, has 2 and 3 BHK apartments and penthouses, with an indoor pool, gym, library, theatre and more than 20 amenities.',
  },
  {
    question: 'Where do you work?',
    answer:
      'We are based in Jaipur and take on projects across Rajasthan, including towns near Jaipur such as Chaksu, Bagru, Chomu, Bassi and Kukas. Tell us the location and we will confirm how we can help.',
  },
]

/** Questions on the Environmental Clearance page, also published as FAQPage data. */
export const clearanceFaqs: readonly Faq[] = [
  {
    question: 'Who grants Environmental Clearance in Rajasthan?',
    answer:
      'Under the EIA Notification, 2006, Category A projects are appraised by the Ministry of Environment, Forest and Climate Change, and Category B projects by the State Environment Impact Assessment Authority (SEIAA) in Rajasthan. We confirm the category and the authority for your project.',
  },
  {
    question: 'Does my building or township need Environmental Clearance?',
    answer:
      'Building and construction projects and townships above the built-up area thresholds in the EIA Notification need prior Environmental Clearance. Share your project area and we will tell you whether it applies.',
  },
  {
    question: 'What is the difference between Environmental Clearance and CTE/CTO?',
    answer:
      'Environmental Clearance is granted once, before work starts, for listed projects. Consent to Establish and Consent to Operate come from the State Pollution Control Board, and the Consent to Operate is renewed periodically.',
  },
  {
    question: 'Do you handle mining EIA and mine closure plans?',
    answer:
      'Yes. For major and minor minerals, quarries and sand, we prepare EIA and EMP reports, support public hearings, and prepare progressive and final mine closure plans.',
  },
  {
    question: 'What happens after the clearance is granted?',
    answer:
      'Clearances come with conditions. We prepare six-monthly EC compliance reports, consent renewals and annual environmental statements, and arrange monitoring, so nothing lapses.',
  },
]
