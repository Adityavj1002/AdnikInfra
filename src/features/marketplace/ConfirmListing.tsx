'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { routes } from '@/lib/routes'
import { confirmListing, type ConfirmState } from './actions'
import styles from './marketplace.module.css'

const initial: ConfirmState = { status: 'idle' }

export function ConfirmListing({ token }: Readonly<{ token: string }>) {
  const [state, action, pending] = useActionState(confirmListing, initial)

  if (state.status === 'confirmed') {
    return (
      <div className={styles.statusPanel} role="status">
        <h2>Thank you. Your listing is with our team.</h2>
        <p>
          Reference <strong>{state.reference}</strong>. We will email you as soon as it is approved, or if anything needs changing.
        </p>
        <Link href={routes.marketplace} className="button button--outline">
          Browse the marketplace
        </Link>
      </div>
    )
  }

  const problem =
    state.status === 'expired'
      ? 'This link has expired. Please submit the listing again.'
      : state.status === 'invalid'
        ? 'This link is not valid, or the listing was already confirmed.'
        : state.status === 'unavailable'
          ? 'We could not confirm that just now. Please try again in a few minutes.'
          : undefined

  return (
    <form action={action} className={styles.statusPanel}>
      <h2>One last step</h2>
      <p>Press the button to confirm your email and send the listing to our team for review.</p>
      {problem && (
        <p className="field__error" role="alert">
          {problem}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Confirming…' : 'Confirm my listing'}
      </button>
    </form>
  )
}
