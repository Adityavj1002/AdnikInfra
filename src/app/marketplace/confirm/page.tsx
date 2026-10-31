import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { ConfirmListing } from '@/features/marketplace/ConfirmListing'
import styles from '@/features/marketplace/marketplace.module.css'
import { isTokenShape } from '@/security/tokens'

export const metadata: Metadata = { title: 'Confirm your listing', robots: { index: false, follow: false } }

export default async function ConfirmListingPage({ searchParams }: Readonly<{ searchParams: Promise<{ token?: string | string[] }> }>) {
  const { token } = await searchParams
  return (
    <>
      <PageHero eyebrow="Marketplace" title="Confirm your listing" />
      <section className="section section--tight" aria-label="Confirmation">
        <div className="container">
          {isTokenShape(token) ? (
            <ConfirmListing token={token} />
          ) : (
            <div className={styles.statusPanel} role="alert">
              <p>This link is not valid. Please use the button in the email we sent you.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
