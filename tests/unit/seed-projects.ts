import seed from '../../supabase/seed/projects.json'
import { localities } from '@/content/data/localities'
import type { Project } from '@/content/types'
import { recordSchema, toProject, type ProjectRecord } from '@/features/projects/content'

// Project photos are on Cloudinary; any cloud name lets the references resolve to URLs.
process.env.NEXT_PUBLIC_IMAGE_CLOUD ||= 'demo'

/** The projects a fresh database starts with (supabase/seed/projects.json), as validated records. */
export const seedRecords: readonly Readonly<{ slug: string; record: ProjectRecord }>[] = seed.map((item) => ({
  slug: item.slug,
  record: recordSchema.parse(item.record),
}))

/** The same projects as the pages render them. */
export const seedProjects: readonly Project[] = seedRecords.map(({ slug, record }) =>
  toProject(slug, record, record.createdAt ?? '2026-11-04', localities.find((l) => l.slug === record.localitySlug)!.geo),
)
