import Image from 'next/image'
import Link from 'next/link'
import { getLocalities, getProjects } from '@/content/repository'
import { ActionForm } from '@/features/admin/ActionForm'
import { setFeaturedProject } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { NO_FEATURED, featuredProjectSlug } from '@/features/featured/featured'
import { savedProjects } from '@/features/projects/content'
import { projectStage, projectTypeLabel } from '@/lib/format'
import { routes } from '@/lib/routes'

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

type Props = Readonly<{ searchParams: Promise<{ deleted?: string }> }>

export default async function AdminProjectsPage({ searchParams }: Props) {
  await requireAdmin()
  const { deleted } = await searchParams
  const [projects, localities, chosen, saved] = await Promise.all([getProjects(), getLocalities(), featuredProjectSlug(), savedProjects()])
  const featured = chosen === NO_FEATURED ? undefined : (projects.find((p) => p.slug === chosen) ?? projects.find((p) => p.featured) ?? projects[0])
  const place = (slug: string) => localities.find((l) => l.slug === slug)?.name

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Projects</h1>
        <Link href={routes.adminProjectNew} className="button button--gold">
          Add a project
        </Link>
      </div>
      <p className={styles.rowMeta}>
        Every project on the website is managed here: text, homes, photos, plans, video and progress. The featured project leads the{' '}
        <Link href={routes.home}>home page</Link>.
      </p>
      {deleted && (
        <p role="status" className={styles.ok}>
          The project was deleted from the website.
        </p>
      )}
      {projects.length === 0 && <p className={styles.rowMeta}>No projects yet. Add the first one.</p>}
      <ul role="list" className={styles.projectList}>
        {projects.map((project) => {
          const cover = project.gallery[0]
          const edited = saved.find((p) => p.slug === project.slug)
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
                  {projectTypeLabel[project.type]} · {projectStage(project)}
                  {place(project.localitySlug) ? ` · ${place(project.localitySlug)}` : ''} · {project.gallery.length} photos
                </p>
                <p className={styles.rowMeta}>{edited ? `Last saved ${when.format(new Date(edited.updatedAt))} IST` : ''}</p>
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
