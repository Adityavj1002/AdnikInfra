import 'server-only'
import { getLocality, getProject, getProperty, getTown } from '@/content/repository'
import { services } from '@/content/services'

export type EnquiryAbout = Readonly<{ slug: string; name: string }>

/**
 * What an enquiry is about, from the `ref` slug a page links with: a project, a listing, a
 * town near Jaipur, a Jaipur locality or a service. Unknown slugs resolve to nothing.
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
  return service && { slug: service.slug, name: service.title }
}
