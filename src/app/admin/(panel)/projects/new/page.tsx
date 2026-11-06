import Link from 'next/link'
import { getLocalities } from '@/content/repository'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { emptyRecord } from '@/features/projects/content'
import { ProjectEditor } from '@/features/projects/ProjectEditor'
import { routes } from '@/lib/routes'

export default async function NewProjectPage() {
  await requireAdmin()
  const localities = await getLocalities()

  return (
    <>
      <p className={styles.rowMeta}>
        <Link href={routes.adminProjects}>Projects</Link>
      </p>
      <h1 className={styles.title}>Add a project</h1>
      <p className={styles.rowMeta}>It goes live on the website as soon as you create it, with its own page, and appears in the projects list.</p>
      <ProjectEditor mode="create" record={emptyRecord(localities[0]?.slug ?? '')} localities={localities} />
    </>
  )
}
