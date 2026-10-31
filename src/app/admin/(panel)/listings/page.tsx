import Link from 'next/link'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { LISTING_STATUSES, listingKindLabels, listingStatusLabels, type ListingStatus } from '@/features/marketplace/constants'
import { listingPlace, listingPrice } from '@/features/marketplace/format'
import { getStore } from '@/features/marketplace/runtime'
import { routes } from '@/lib/routes'

const PAGE_SIZE = 25

export default async function AdminListingsPage({ searchParams }: Readonly<{ searchParams: Promise<{ status?: string | string[]; page?: string | string[] }> }>) {
  await requireAdmin()
  const query = await searchParams
  const status: ListingStatus = LISTING_STATUSES.find((s) => s === query.status) ?? 'pending'
  const page = Math.max(1, Math.min(1000, Number(query.page) || 1))
  const { items, total } = await (await getStore()).listListings({ status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
  const href = (target: number) => `${routes.adminListings}?status=${status}${target > 1 ? `&page=${target}` : ''}`
  return (
    <>
      <h1 className={styles.title}>Listings</h1>
      <nav aria-label="Filter by status" className={styles.tabs}>
        {LISTING_STATUSES.map((value) => (
          <Link key={value} href={`${routes.adminListings}?status=${value}`} className={styles.tab} {...(value === status ? { 'aria-current': 'page' as const } : {})}>
            {listingStatusLabels[value]}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <p>No listings here.</p>
      ) : (
        <ul role="list" className={styles.list}>
          {items.map((listing) => (
            <li key={listing.id} className={styles.row}>
              <div>
                <p className={styles.rowTitle}>{listing.title}</p>
                <p className={styles.rowMeta}>
                  {listingKindLabels[listing.kind]} · {listingPlace(listing)} · {listingPrice(listing)} · {listing.reference}
                </p>
              </div>
              <Link href={routes.adminListing(listing.id)} className="button button--outline button--small">Open</Link>
            </li>
          ))}
        </ul>
      )}
      {total > PAGE_SIZE && (
        <nav aria-label="Pages" className={styles.tabs}>
          {page > 1 && <Link href={href(page - 1)} className={styles.tab}>Previous</Link>}
          {page * PAGE_SIZE < total && <Link href={href(page + 1)} className={styles.tab}>Next</Link>}
        </nav>
      )}
    </>
  )
}
