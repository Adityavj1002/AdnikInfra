import Link from 'next/link'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { listingKindLabels } from '@/features/marketplace/constants'
import { listingPlace, listingPrice } from '@/features/marketplace/format'
import { getStore } from '@/features/marketplace/runtime'
import { routes } from '@/lib/routes'

export default async function AdminOverviewPage() {
  await requireAdmin()
  const store = await getStore()
  const [counts, subscribers, { items: queue }] = await Promise.all([
    store.countListings(),
    store.countSubscribers(),
    store.listListings({ status: 'pending', limit: 10 }),
  ])
  const stats = [
    { label: 'Waiting for review', value: counts.pending, href: `${routes.adminListings}?status=pending` },
    { label: 'Live listings', value: counts.approved, href: `${routes.adminListings}?status=approved` },
    { label: 'Rejected', value: counts.rejected, href: `${routes.adminListings}?status=rejected` },
    { label: 'Email not confirmed', value: counts.unconfirmed, href: `${routes.adminListings}?status=unconfirmed` },
    { label: 'Subscribers', value: subscribers.active, href: routes.adminSubscribers },
  ]
  return (
    <>
      <h1 className={styles.title}>Overview</h1>
      <ul role="list" className={styles.stats}>
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className={styles.stat}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className={styles.section} aria-labelledby="queue-title">
        <h2 id="queue-title" className={styles.sectionTitle}>Review queue</h2>
        {queue.length === 0 ? (
          <p>Nothing is waiting for review.</p>
        ) : (
          <ul role="list" className={styles.list}>
            {queue.map((listing) => (
              <li key={listing.id} className={styles.row}>
                <div>
                  <p className={styles.rowTitle}>{listing.title}</p>
                  <p className={styles.rowMeta}>
                    {listingKindLabels[listing.kind]} · {listingPlace(listing)} · {listingPrice(listing)} · {listing.reference}
                  </p>
                </div>
                <Link href={routes.adminListing(listing.id)} className="button button--small">Review</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
