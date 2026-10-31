/** Every internal URL is built here, so links, sitemap, canonicals and JSON-LD always agree. */
export const routes = {
  home: '/',
  projects: '/projects',
  project: (slug: string) => `/projects/${slug}`,
  properties: '/properties',
  property: (slug: string) => `/properties/${slug}`,
  construction: '/construction',
  environmentalClearance: '/environmental-clearance',
  locations: '/locations',
  location: (slug: string) => `/locations/${slug}`,
  nearJaipur: '/locations/near-jaipur',
  town: (slug: string) => `/locations/near-jaipur/${slug}`,
  about: '/about',
  blog: '/blog',
  post: (slug: string) => `/blog/${slug}`,
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  accessibility: '/accessibility',
  services: '/services',
  service: (slug: string) => `/services/${slug}`,
  sector: (slug: string) => `/sectors/${slug}`,
  marketplace: '/marketplace',
  marketplaceListing: (slug: string) => `/marketplace/${slug}`,
  marketplaceSell: '/marketplace/sell',
  marketplaceConfirm: '/marketplace/confirm',
  subscribeConfirm: '/subscribe/confirm',
  unsubscribe: '/unsubscribe',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminListings: '/admin/listings',
  adminListing: (id: string) => `/admin/listings/${id}`,
  adminSubscribers: '/admin/subscribers',
  adminCampaigns: '/admin/campaigns',
  adminTeam: '/admin/team',
  adminAccount: '/admin/account',
} as const

export type EnquiryTopic = 'proposal' | 'buy' | 'site-visit' | 'construction' | 'sell' | 'other'

/** Deep link into the contact form with the topic (and optionally the item) pre-selected. */
export function contactHref(topic: EnquiryTopic, ref?: string): string {
  const params = new URLSearchParams({ topic })
  if (ref) params.set('ref', ref)
  return `${routes.contact}?${params.toString()}#enquiry`
}

/** Google Maps search link for a coordinate. A link, not an embed: no third-party script or frame. */
export function mapsHref({ lat, lng }: Readonly<{ lat: number; lng: number }>): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(5)},${lng.toFixed(5)}`
}
