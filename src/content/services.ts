import { contactHref, routes } from '@/lib/routes'

/** The six service lines: the home page cards and the footer's Services column. */
export type Service = Readonly<{ number: string; title: string; body: string; href: string; highlight?: boolean }>

export const services: readonly Service[] = [
  {
    number: '01',
    title: 'Building Construction',
    body: 'Thoughtful planning and coordinated execution for residential, commercial and institutional buildings.',
    href: routes.construction,
  },
  {
    number: '02',
    title: 'Warehouse Construction',
    body: 'Purpose-built industrial spaces, with a focus on operational flow, structural needs and future use.',
    href: contactHref('construction', 'Warehouse Construction'),
  },
  {
    number: '03',
    title: 'Roads & Infrastructure',
    body: 'Civil infrastructure development that connects places and supports long-term growth.',
    href: contactHref('construction', 'Roads & Infrastructure'),
  },
  {
    number: '04',
    title: 'Project Management',
    body: 'Scope, schedule and site coordination to keep every stage of your project aligned.',
    href: contactHref('construction', 'Project Management'),
    highlight: true,
  },
  {
    number: '05',
    title: 'Real Estate Consultancy',
    body: 'Practical guidance for land, real estate evaluation and informed real estate decisions.',
    href: routes.properties,
  },
  {
    number: '06',
    title: 'Environmental Clearance',
    body: 'Applicability assessment, documentation and application support for environmental clearance.',
    href: contactHref('other', 'Environmental Clearance'),
  },
]
