import { routes } from '@/lib/routes'

/**
 * The four service lines: the home page cards and the footer's Services column. The slug goes
 * on contact links from each service's page, so an enquiry says which service it's about.
 */
export type Service = Readonly<{
  slug: string
  number: string
  title: string
  body: string
  href: string
  /** Card link label, when the service has its own page. */
  cta?: string
  highlight?: boolean
}>

export const services: readonly Service[] = [
  {
    slug: 'construction-advisory',
    number: '01',
    title: 'Construction Advisory',
    body: 'Design review, costing and contractor selection, then project management on site through to handover.',
    href: routes.service('construction-advisory'),
  },
  {
    slug: 'environmental-clearance',
    number: '02',
    title: 'Environmental Clearance',
    body: 'EIA, EC and consents, plus ECBC and ENS compliance, for infrastructure, industrial and mining projects.',
    href: routes.environmentalClearance,
    cta: 'See the full service',
    highlight: true,
  },
  {
    slug: 'real-estate-consultancy',
    number: '03',
    title: 'Real Estate Consultancy',
    body: 'Land due diligence, feasibility and approvals support for developers and landowners.',
    href: routes.service('real-estate-consultancy'),
  },
  {
    slug: 'infrastructure-development',
    number: '04',
    title: 'Infrastructure Development',
    body: 'Planning and delivery of buildings, roads, utilities and campuses.',
    href: routes.service('infrastructure-development'),
  },
]
