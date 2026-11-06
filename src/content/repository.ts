import 'server-only'
import { savedProjects, toProject } from '@/features/projects/content'
import { isSlug } from '@/lib/slug'
import { packages, posts, stats } from './fixtures/company'
import { faqGroups } from './fixtures/faqs'
import { localities } from './fixtures/localities'
import { towns } from './fixtures/towns'
import type {
  ConstructionPackage,
  FaqGroup,
  Locality,
  Post,
  Project,
  ProjectStatus,
  ProjectType,
  Stat,
  Town,
} from './types'

/**
 * Read-only content access (ARCHITECTURE.md §5). Async so a CMS adapter can replace the
 * local fixtures without touching any page.
 */

/** Rejects malformed route params before they reach a lookup. */
export function isValidSlug(value: string): boolean {
  return isSlug(value)
}

export async function getLocalities(): Promise<readonly Locality[]> {
  return localities
}

export async function getLocality(slug: string): Promise<Locality | undefined> {
  return localities.find((locality) => locality.slug === slug)
}

export type ProjectFilter = Readonly<{ status?: ProjectStatus; type?: ProjectType; locality?: string }>

/** Projects come only from the database (Admin → Projects); none is written in the code. */
async function currentProjects(): Promise<readonly Project[]> {
  return (await savedProjects()).flatMap(({ slug, record, updatedAt }) => {
    const locality = localities.find((l) => l.slug === record.localitySlug)
    return locality ? [toProject(slug, record, updatedAt, locality.geo)] : []
  })
}

export async function getProjects(filter: ProjectFilter = {}): Promise<readonly Project[]> {
  return (await currentProjects()).filter(
    (project) =>
      (!filter.status || project.status === filter.status) &&
      (!filter.type || project.type === filter.type) &&
      (!filter.locality || project.localitySlug === filter.locality),
  )
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await currentProjects()).find((project) => project.slug === slug)
}

export async function getPackages(): Promise<readonly ConstructionPackage[]> {
  return packages
}

export async function getTowns(): Promise<readonly Town[]> {
  return towns
}

export async function getTown(slug: string): Promise<Town | undefined> {
  return towns.find((town) => town.slug === slug)
}

export async function getFaqGroups(): Promise<readonly FaqGroup[]> {
  return faqGroups
}

/** Company stats are sample placeholders until the client confirms real figures. */
export async function getStats(): Promise<readonly Stat[]> {
  return stats
}

export async function getPosts(): Promise<readonly Post[]> {
  return [...posts].sort((a, b) => b.published.localeCompare(a.published))
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return posts.find((post) => post.slug === slug)
}
