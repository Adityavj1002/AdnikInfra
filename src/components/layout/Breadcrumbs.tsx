import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Crumb } from '@/seo/schema'
import styles from './Breadcrumbs.module.css'

/** Visible trail; the matching BreadcrumbList JSON-LD is built from the same crumbs. */
export function Breadcrumbs({ crumbs }: Readonly<{ crumbs: readonly Crumb[] }>) {
  return (
    <nav aria-label="Breadcrumb" className={`container ${styles.wrap}`}>
      <ol role="list" className={styles.list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={crumb.path} className={styles.item}>
              {index > 0 && <ChevronRight aria-hidden="true" className={styles.separator} strokeWidth={1.75} />}
              {isLast ? (
                <span aria-current="page" className={styles.current}>
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className={styles.link}>
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
