'use client'

import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { routes } from '@/lib/routes'
import styles from './status.module.css'

/**
 * Route-level error boundary. Shows no technical detail; the digest lets support find the log line.
 * "Try again" reloads the page: a tab opened before a deploy can only recover by fetching the new build.
 */
export default function ErrorPage({ error }: Readonly<{ error: Error & { digest?: string } }>) {
  return (
    <>
      <PageHero
        eyebrow="Error"
        title="Something went wrong on our side"
        lead={<p>Please try again. If it keeps happening, let us know{error.digest ? ` and quote reference ${error.digest}` : ''}.</p>}
      />
      <div className="container">
        <div className={styles.actions}>
          <button type="button" className="button" onClick={() => window.location.reload()}>
            Try again
          </button>
          <Link href={routes.home} className="button button--outline">
            Go to the home page
          </Link>
        </div>
      </div>
    </>
  )
}
