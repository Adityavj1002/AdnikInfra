import Image from 'next/image'
import Link from 'next/link'
import { getLocalities, getProjects } from '@/content/repository'
import { ActionForm } from '@/features/admin/ActionForm'
import { setFeaturedProject } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { NO_FEATURED, featuredProjectSlug } from '@/features/featured/featured'
import { savedProjects } from '@/features/projects/content'
import { projectStatusLabel, projectTypeLabel } from '@/lib/format'
import { routes } from '@/lib/routes'

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

export default async function AdminProjectsPage() {
  await requireAdmin()
  const [projects, localities, chosen, saved] = await Promise.all([getProjects(), getLocalities(), featuredProjectSlug(), savedProjects()])
  const featured = chosen === NO_FEATURED ? undefined : (projects.find((p) => p.slug === chosen) ?? projects.find((p) => p.featured) ?? projects[0])
  const place = (slug: string) => localities.find((l) => l.slug === slug)?.name

  return (
    <>
      <h1 className={styles.title}>Projects</h1>
      <p className={styles.rowMeta}>
        Edit a project’s text, homes, amenities, unit areas and photos. The featured project leads the <Link href={routes.home}>home page</Link>.
      </p>
      <ul role="list" className={styles.projectList}>
        {projects.map((project) => {
          const cover = project.gallery[0]
          const edited = saved[project.slug]
          return (
            <li key={project.slug} className={styles.projectRow}>
              {cover && (
                <span className={styles.projectCover}>
                  <Image src={cover.src} alt="" fill sizes="12rem" />
                </span>
              )}
              <div className={styles.projectBody}>
                <h2 className={styles.sectionTitle}>{project.name}</h2>
                <p className={styles.rowMeta}>
                  {projectTypeLabel[project.type]} · {projectStatusLabel[project.status]}
                  {place(project.localitySlug) ? ` · ${place(project.localitySlug)}` : ''} · {project.gallery.length} photos
                </p>
                <p className={styles.rowMeta}>{edited ? `Last edited ${when.format(new Date(edited.updatedAt))} IST` : 'As bundled with the website'}</p>
                {project.slug === featured?.slug &&
                  (project.gallery.length > 0 ? (
                    <span className="badge badge--gold">Featured on the home page</span>
                  ) : (
                    <span className="badge">Featured, but hidden until it has a photo</span>
                  ))}
              </div>
              <div className={styles.projectActions}>
                <Link href={routes.adminProject(project.slug)} className="button">
                  Edit project
                </Link>
                <ActionForm
                  action={setFeaturedProject}
                  submitLabel={project.slug === featured?.slug ? 'Remove from home page' : 'Feature on home page'}
                  pendingLabel="Saving…"
                  variant="outline"
                  className={styles.inlineForm}
                >
                  <input type="hidden" name="project" value={project.slug === featured?.slug ? NO_FEATURED : project.slug} />
                </ActionForm>
                <Link href={routes.project(project.slug)} className="link-more">
                  View on website
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
