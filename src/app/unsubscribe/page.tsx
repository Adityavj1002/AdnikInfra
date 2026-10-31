import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Unsubscribe } from '@/features/alerts/SubscriptionPanels'
import styles from '@/features/marketplace/marketplace.module.css'
import { marketplaceEnabled } from '@/features/marketplace/runtime'
import { readUnsubscribe } from '@/features/marketplace/subscriptions'

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false, follow: false } }

export default async function UnsubscribePage({ searchParams }: Readonly<{ searchParams: Promise<{ e?: string | string[]; s?: string | string[] }> }>) {
  const { e, s } = await searchParams
  const email = marketplaceEnabled ? readUnsubscribe(e, s) : undefined
  return (
    <>
      <PageHero eyebrow="Newsletter" title="Unsubscribe" />
      <section className="section section--tight" aria-label="Unsubscribe">
        <div className="container">
          {email && typeof e === 'string' && typeof s === 'string' ? (
            <Unsubscribe email={email} e={e} s={s} />
          ) : (
            <div className={styles.statusPanel} role="alert">
              <p>This link is not valid. Please use the unsubscribe link in one of our emails.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
