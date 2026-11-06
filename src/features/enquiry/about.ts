import 'server-only'
import { getLocality, getProject, getTown } from '@/content/repository'
import { services } from '@/content/services'
import { getStore, storeEnabled } from '@/store/runtime'

export type EnquiryAbout = Readonly<{ slug: string; name: string }>

/** Pages with their own enquiry reference that aren't a project, place or service line. */
const pages: readonly EnquiryAbout[] = [{ slug: 'warehouse-construction', name: 'Warehouse construction' }]

/**
 * What an enquiry is about, from the `ref` slug a page links with: a project, a town near
 * Jaipur, a Jaipur locality, a page, a service or a live marketplace listing. Unknown slugs
 * resolve to nothing.
 */
export async function resolveEnquiryAbout(ref: string | undefined): Promise<EnquiryAbout | undefined> {
  if (!ref) return undefined
  const project = await getProject(ref)
  if (project) return { slug: project.slug, name: project.name }
  const town = await getTown(ref)
  if (town) return { slug: town.slug, name: `${town.name}, near Jaipur` }
  const locality = await getLocality(ref)
  if (locality) return { slug: locality.slug, name: `${locality.name}, Jaipur` }
  const page = pages.find((p) => p.slug === ref)
  if (page) return page
  const service = services.find((s) => s.slug === ref)
  if (service) return { slug: service.slug, name: service.title }
  if (!storeEnabled) return undefined
  // Only a live listing can be named; a store outage must not break the enquiry itself.
  const listing = await (await getStore()).getListingBySlug(ref).catch(() => undefined)
  return listing?.status === 'approved' ? { slug: listing.slug, name: listing.title } : undefined
}
