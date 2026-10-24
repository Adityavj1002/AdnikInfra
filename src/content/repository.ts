import 'server-only'
import { isSlug } from '@/lib/slug'
import { packages, posts, stats } from './fixtures/company'
import { faqGroups } from './fixtures/faqs'
import { localities } from './fixtures/localities'
import { projects } from './fixtures/projects'
import { properties } from './fixtures/properties'
import { towns } from './fixtures/towns'
import type {
  ConstructionPackage,
  FaqGroup,
  Locality,
  Post,
  Project,
  ProjectStatus,
  ProjectType,
  Property,
  PropertyType,
  Stat,
  Town,
} from './types'

/**
 * Read-only content access (ARCHITECTURE.md §5). Async so a CMS adapter can replace the
 * local fixtures without touching any page.
 */

/** True while the site runs on bundled sample content; drives the "sample content" notice. */
export const isSampleContent = true

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

export type ProjectFilter = Readonly<{ status?: ProjectStatus; type?: ProjectType; locality?: string; featured?: boolean }>

export async function getProjects(filter: ProjectFilter = {}): Promise<readonly Project[]> {
  return projects.filter(
    (project) =>
      (!filter.status || project.status === filter.status) &&
      (!filter.type || project.type === filter.type) &&
      (!filter.locality || project.localitySlug === filter.locality) &&
      (filter.featured === undefined || project.featured === filter.featured),
  )
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((project) => project.slug === slug)
}

export type PropertySort = 'newest' | 'price-asc' | 'price-desc'

export type PropertyFilter = Readonly<{
  type?: PropertyType
  locality?: string
  bhk?: number
  /** Upper bound in rupees. */
  maxPrice?: number
  sort?: PropertySort
}>

export async function getProperties(filter: PropertyFilter = {}): Promise<readonly Property[]> {
  const matches = properties.filter(
    (property) =>
      (!filter.type || property.type === filter.type) &&
      (!filter.locality || property.localitySlug === filter.locality) &&
      (!filter.bhk || (filter.bhk >= 4 ? (property.bhk ?? 0) >= 4 : property.bhk === filter.bhk)) &&
      (!filter.maxPrice || property.price.amount <= filter.maxPrice),
  )
  const sorted = [...matches]
  if (filter.sort === 'price-asc') sorted.sort((a, b) => a.price.amount - b.price.amount)
  else if (filter.sort === 'price-desc') sorted.sort((a, b) => b.price.amount - a.price.amount)
  else sorted.sort((a, b) => b.listedAt.localeCompare(a.listedAt))
  return sorted
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  return properties.find((property) => property.slug === slug)
}

export async function getPackages(): Promise<readonly ConstructionPackage[]> {
  return packages
}

/** Company stats are sample placeholders until the client confirms real figures. */
export async function getTowns(): Promise<readonly Town[]> {
  return towns
}

export async function getTown(slug: string): Promise<Town | undefined> {
  return towns.find((town) => town.slug === slug)
}

export async function getFaqGroups(): Promise<readonly FaqGroup[]> {
  return faqGroups
}

export async function getStats(): Promise<readonly Stat[]> {
  return stats
}

export async function getPosts(): Promise<readonly Post[]> {
  return [...posts].sort((a, b) => b.published.localeCompare(a.published))
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return posts.find((post) => post.slug === slug)
}
