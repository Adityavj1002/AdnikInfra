import { ActionForm } from '@/features/admin/ActionForm'
import { sendCampaign } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { getStore } from '@/features/marketplace/runtime'

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

export default async function AdminCampaignsPage() {
  await requireAdmin()
  const store = await getStore()
  const [counts, campaigns] = await Promise.all([store.countSubscribers(), store.listCampaigns(50)])
  return (
    <>
      <h1 className={styles.title}>Campaigns</h1>
      <section className={styles.panel} aria-labelledby="new-title">
        <h2 id="new-title" className={styles.sectionTitle}>New campaign</h2>
        <p className={styles.rowMeta}>
          Goes to {counts.active} confirmed {counts.active === 1 ? 'subscriber' : 'subscribers'}, each with an unsubscribe link. Gmail allows about 500 emails a day (Workspace about 2,000).
        </p>
        <ActionForm action={sendCampaign} submitLabel="Send campaign" pendingLabel="Starting…" confirm={`Send this to ${counts.active} subscribers? This cannot be undone.`}>
          <div className="field">
            <label className="field__label" htmlFor="campaign-subject">Subject</label>
            <input id="campaign-subject" name="subject" className="input" type="text" required maxLength={150} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="campaign-body">Message</label>
            <p className="field__hint">Plain text. Leave a blank line between paragraphs.</p>
            <textarea id="campaign-body" name="body" className="textarea" rows={10} required maxLength={20000} />
          </div>
          <label className="choice" htmlFor="campaign-listings">
            <input id="campaign-listings" name="includeListings" type="checkbox" />
            <span>Add the 4 newest marketplace listings</span>
          </label>
        </ActionForm>
      </section>
      <section className={styles.section} aria-labelledby="sent-title">
        <h2 id="sent-title" className={styles.sectionTitle}>Sent</h2>
        {campaigns.length === 0 ? (
          <p>No campaigns yet.</p>
        ) : (
          <ul role="list" className={styles.list}>
            {campaigns.map((campaign) => (
              <li key={campaign.id} className={styles.row}>
                <p className={styles.rowTitle}>{campaign.subject}</p>
                <p className={styles.rowMeta}>
                  {when.format(new Date(campaign.createdAt))} IST ·{' '}
                  {campaign.status === 'sending'
                    ? `Sending to ${campaign.recipients}…`
                    : `${campaign.sentCount} sent${campaign.failedCount ? `, ${campaign.failedCount} failed` : ''}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
