import { contactHref, routes } from '@/lib/routes'

/**
 * The five service lines: the home page cards and the footer's Services column. The slug goes
 * on contact links, so an enquiry from a service card arrives saying which service it's about.
 */
export type Service = Readonly<{ slug: string; number: string; title: string; body: string; href: string; highlight?: boolean }>

export const services: readonly Service[] = [
  {
    slug: 'construction-advisory',
    number: '01',
    title: 'Construction Advisory',
    body: 'Technical advice on design review, specifications, costing and contractor selection.',
    href: routes.construction,
  },
  {
    slug: 'environmental-clearance',
    number: '02',
    title: 'Environmental Clearance',
    body: 'EIA, EC and consents, plus ECBC and ENS compliance, for infrastructure, industrial and mining projects.',
    href: contactHref('other', 'environmental-clearance'),
    highlight: true,
  },
  {
    slug: 'project-management',
    number: '03',
    title: 'Project Management',
    body: 'Scheduling, site coordination, quality and cost control from mobilisation to handover.',
    href: contactHref('construction', 'project-management'),
  },
  {
    slug: 'real-estate-consultancy',
    number: '04',
    title: 'Real Estate Consultancy',
    body: 'Land due diligence, feasibility and approvals support for developers and landowners.',
    href: routes.properties,
  },
  {
    slug: 'infrastructure-development',
    number: '05',
    title: 'Infrastructure Development',
    body: 'Planning and delivery of buildings, roads, utilities and campuses.',
    href: contactHref('construction', 'infrastructure-development'),
  },
]
