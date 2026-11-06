import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocalities, isValidSlug } from '@/content/repository'
import { ActionForm } from '@/features/admin/ActionForm'
import { deleteProject } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { savedProject } from '@/features/projects/content'
import { ProjectEditor } from '@/features/projects/ProjectEditor'
import { routes } from '@/lib/routes'

type Props = Readonly<{ params: Promise<{ slug: string }>; searchParams: Promise<{ created?: string }> }>

export default async function AdminProjectPage({ params, searchParams }: Props) {
  await requireAdmin()
  const { slug } = await params
  const saved = isValidSlug(slug) ? await savedProject(slug) : undefined
  if (!saved) notFound()
  const [localities, { created }] = await Promise.all([getLocalities(), searchParams])

  return (
    <>
      <p className={styles.rowMeta}>
        <Link href={routes.adminProjects}>Projects</Link> · <Link href={routes.project(slug)}>View on website</Link>
      </p>
      <h1 className={styles.title}>Edit {saved.record.name}</h1>
      {created && (
        <p role="status" className={styles.ok}>
          {saved.record.name} is live at <Link href={routes.project(slug)}>{routes.project(slug)}</Link>.
        </p>
      )}
      <ProjectEditor mode="edit" slug={slug} record={saved.record} localities={localities} />

      <section className={`${styles.panel} ${styles.dangerZone}`} aria-labelledby="delete-title">
        <h2 id="delete-title" className={styles.sectionTitle}>Delete this project</h2>
        <p className={styles.rowMeta}>It disappears from the website at once. This can’t be undone.</p>
        <ActionForm action={deleteProject} submitLabel="Delete project" pendingLabel="Deleting…" variant="outline">
          <input type="hidden" name="slug" value={slug} />
          <div className="field">
            <label className="field__label" htmlFor="delete-confirm">Type “{slug}” to confirm</label>
            <input id="delete-confirm" name="confirm" className="input" type="text" autoComplete="off" required />
          </div>
        </ActionForm>
      </section>
    </>
  )
}
