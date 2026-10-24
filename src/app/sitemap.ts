import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { getLocalities, getPosts, getProjects, getProperties, getTowns } from '@/content/repository'
import { routes } from '@/lib/routes'
import { absoluteUrl } from '@/seo/schema'

type Entry = MetadataRoute.Sitemap[number]

const latest = (dates: readonly string[]): string => [...dates].sort().at(-1) ?? '2026-10-24'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()
  const [projects, properties, localities, posts, towns] = await Promise.all([
    getProjects(),
    getProperties(),
    getLocalities(),
    getPosts(),
    getTowns(),
  ])

  const entry = (path: string, lastModified: string, priority: number, images?: readonly string[]): Entry => ({
    url: absoluteUrl(path),
    lastModified,
    priority,
    ...(images && images.length > 0 ? { images: images.map(absoluteUrl) } : {}),
  })

  const projectsUpdated = latest(projects.map((p) => p.updatedAt))
  const propertiesUpdated = latest(properties.map((p) => p.updatedAt))
  const localitiesUpdated = latest(localities.map((l) => l.updatedAt))
  const postsUpdated = latest(posts.map((p) => p.updatedAt))
  const siteUpdated = latest([projectsUpdated, propertiesUpdated, localitiesUpdated, postsUpdated])

  return [
    entry(routes.home, siteUpdated, 1),
    entry(routes.projects, projectsUpdated, 0.9),
    ...projects.map((p) => entry(routes.project(p.slug), p.updatedAt, 0.9, p.gallery.map((img) => img.src.src))),
    entry(routes.properties, propertiesUpdated, 0.9),
    ...properties.map((p) => entry(routes.property(p.slug), p.updatedAt, 0.8, p.gallery.map((img) => img.src.src))),
    entry(routes.construction, siteUpdated, 0.9),
    entry(routes.locations, localitiesUpdated, 0.7),
    ...localities.map((l) => entry(routes.location(l.slug), l.updatedAt, 0.8)),
    entry(routes.nearJaipur, siteUpdated, 0.8),
    ...towns.map((t) => entry(routes.town(t.slug), siteUpdated, 0.8)),
    entry(routes.about, siteUpdated, 0.5),
    entry(routes.blog, postsUpdated, 0.6),
    ...posts.map((p) => entry(routes.post(p.slug), p.updatedAt, 0.6)),
    entry(routes.contact, siteUpdated, 0.6),
    entry(routes.faq, '2026-10-24', 0.5),
    entry(routes.terms, '2026-10-24', 0.2),
    entry(routes.privacy, '2026-10-24', 0.2),
    entry(routes.disclaimer, '2026-10-24', 0.2),
    entry(routes.accessibility, '2026-10-24', 0.2),
  ]
}
