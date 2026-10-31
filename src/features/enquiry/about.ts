import 'server-only'
import { getLocality, getProject, getProperty, getTown } from '@/content/repository'
import { services } from '@/content/services'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'

export type EnquiryAbout = Readonly<{ slug: string; name: string }>

/**
 * What an enquiry is about, from the `ref` slug a page links with: a project, a listing, a
 * town near Jaipur, a Jaipur locality, a service or a live marketplace listing. Unknown slugs resolve to nothing.
 */
export async function resolveEnquiryAbout(ref: string | undefined): Promise<EnquiryAbout | undefined> {
  if (!ref) return undefined
  const project = await getProject(ref)
  if (project) return { slug: project.slug, name: project.name }
  const property = await getProperty(ref)
  if (property) return { slug: property.slug, name: property.title }
  const town = await getTown(ref)
  if (town) return { slug: town.slug, name: `${town.name}, near Jaipur` }
  const locality = await getLocality(ref)
  if (locality) return { slug: locality.slug, name: `${locality.name}, Jaipur` }
  const service = services.find((s) => s.slug === ref)
  if (service) return { slug: service.slug, name: service.title }
  if (!marketplaceEnabled) return undefined
  // Only a live listing can be named; a store outage must not break the enquiry itself.
  const listing = await (await getStore()).getListingBySlug(ref).catch(() => undefined)
  return listing?.status === 'approved' ? { slug: listing.slug, name: listing.title } : undefined
}
