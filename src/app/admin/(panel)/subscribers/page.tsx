import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { getStore } from '@/features/marketplace/runtime'

const date = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })
const statusLabel = { active: 'Subscribed', pending: 'Not confirmed', unsubscribed: 'Unsubscribed' } as const

export default async function AdminSubscribersPage() {
  await requireAdmin()
  const store = await getStore()
  const [counts, { items, total }] = await Promise.all([store.countSubscribers(), store.listSubscribers({ limit: 200 })])
  return (
    <>
      <h1 className={styles.title}>Subscribers</h1>
      <ul role="list" className={styles.stats}>
        <li className={styles.stat}><span className={styles.statValue}>{counts.active}</span><span className={styles.statLabel}>Subscribed</span></li>
        <li className={styles.stat}><span className={styles.statValue}>{counts.pending}</span><span className={styles.statLabel}>Not confirmed</span></li>
        <li className={styles.stat}><span className={styles.statValue}>{counts.unsubscribed}</span><span className={styles.statLabel}>Unsubscribed</span></li>
      </ul>
      {items.length === 0 ? (
        <p>No subscribers yet.</p>
      ) : (
        <>
          {total > items.length && <p className={styles.rowMeta}>Showing the latest {items.length} of {total}.</p>}
          <ul role="list" className={styles.list}>
            {items.map((subscriber) => (
              <li key={subscriber.id} className={styles.row}>
                <p className={styles.rowTitle}>{subscriber.email}</p>
                <p className={styles.rowMeta}>{statusLabel[subscriber.status]} · {date.format(new Date(subscriber.createdAt))}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
