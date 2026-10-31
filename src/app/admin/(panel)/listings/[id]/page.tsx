import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ActionForm } from '@/features/admin/ActionForm'
import { reviewListing } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { listingKindLabels, listingPurposeLabels, listingStatusLabels, sellerRoleLabels } from '@/features/marketplace/constants'
import { listingArea, listingPlace, listingPrice } from '@/features/marketplace/format'
import { ListingPhotos } from '@/features/marketplace/ListingPhotos'
import { photoBase } from '@/features/marketplace/media'
import { getStore } from '@/features/marketplace/runtime'
import { routes } from '@/lib/routes'

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

const outcomes: Readonly<Record<string, string>> = {
  approved: 'Approved: the listing is live.',
  rejected: 'Rejected.',
  unpublished: 'Taken down.',
}

export default async function AdminListingPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ done?: string | string[]; mail?: string | string[] }> }>) {
  await requireAdmin()
  const { id } = await params
  const { done, mail } = await searchParams
  const outcome = typeof done === 'string' && Object.hasOwn(outcomes, done) ? outcomes[done] : undefined
  const store = await getStore()
  const listing = await store.getListing(id)
  if (!listing) notFound()
  const events = await store.listEvents(id)
  const reviewable = listing.status !== 'unconfirmed'

  return (
    <>
      <div>
        <p className={styles.rowMeta}>{listing.reference} · {listingStatusLabels[listing.status]}</p>
        <h1 className={styles.title}>{listing.title}</h1>
      </div>
      {outcome && (
        <p role="status" className={mail === 'failed' ? 'field__error' : styles.ok}>
          {outcome} {mail === 'failed' ? 'The email to the seller could not be sent; please contact them.' : 'The seller has been emailed.'}
        </p>
      )}
      <div className={styles.split}>
        <div className={styles.section}>
          <ListingPhotos photos={listing.images} base={photoBase()} title={listing.title} />
          <section className={styles.panel} aria-labelledby="details-title">
            <h2 id="details-title" className={styles.sectionTitle}>Property</h2>
            <dl className={styles.facts}>
              <div><dt>Type</dt><dd>{listingKindLabels[listing.kind]}, {listingPurposeLabels[listing.purpose].toLowerCase()}</dd></div>
              <div><dt>Price</dt><dd>{listingPrice(listing)}</dd></div>
              <div><dt>Area</dt><dd>{listingArea(listing)}</dd></div>
              {listing.bedrooms !== null && <div><dt>Bedrooms</dt><dd>{listing.bedrooms}</dd></div>}
              <div><dt>Location</dt><dd>{listingPlace(listing)}, {listing.state}</dd></div>
            </dl>
            <p className={styles.description}>{listing.description}</p>
          </section>
        </div>
        <div className={styles.section}>
          <section className={styles.panel} aria-labelledby="seller-title">
            <h2 id="seller-title" className={styles.sectionTitle}>Seller</h2>
            <dl className={styles.facts}>
              <div><dt>Name</dt><dd>{listing.sellerName} ({sellerRoleLabels[listing.sellerRole]})</dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${listing.sellerPhone}`}>{listing.sellerPhone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${listing.sellerEmail}`}>{listing.sellerEmail}</a></dd></div>
            </dl>
          </section>

          <section className={styles.panel} aria-labelledby="review-title">
            <h2 id="review-title" className={styles.sectionTitle}>Decision</h2>
            {!reviewable && <p>The seller has not confirmed their email yet, so this cannot be reviewed.</p>}
            {listing.status === 'approved' && (
              <p><Link prefetch={false} href={routes.marketplaceListing(listing.slug)}>See the live listing</Link></p>
            )}
            {listing.rejectReason && <p className={styles.rowMeta}>Last reason given: {listing.rejectReason}</p>}
            {reviewable && listing.status !== 'approved' && (
              <ActionForm action={reviewListing} submitLabel="Approve and publish" pendingLabel="Publishing…">
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="decision" value="approved" />
                <input type="hidden" name="expected" value={listing.status} />
              </ActionForm>
            )}
            {reviewable && listing.status !== 'rejected' && (
              <ActionForm
                action={reviewListing}
                variant="danger"
                submitLabel={listing.status === 'approved' ? 'Take down' : 'Reject'}
                pendingLabel="Saving…"
              >
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="decision" value={listing.status === 'approved' ? 'unpublished' : 'rejected'} />
                <input type="hidden" name="expected" value={listing.status} />
                <div className="field">
                  <label className="field__label" htmlFor="reject-reason">Reason (emailed to the seller)</label>
                  <textarea id="reject-reason" name="reason" className="textarea" rows={3} maxLength={1000} required />
                </div>
              </ActionForm>
            )}
          </section>

          <section className={styles.panel} aria-labelledby="history-title">
            <h2 id="history-title" className={styles.sectionTitle}>History</h2>
            <ol className={styles.timeline}>
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.action}</strong>
                  {event.adminName ? ` by ${event.adminName}` : ''} · {when.format(new Date(event.createdAt))} IST
                  {event.note ? ` · ${event.note}` : ''}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  )
}
