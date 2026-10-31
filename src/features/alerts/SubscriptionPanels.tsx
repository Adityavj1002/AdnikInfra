'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import styles from '@/features/marketplace/marketplace.module.css'
import { routes } from '@/lib/routes'
import { confirmSubscription, unsubscribeAction } from './actions'
import type { SubscriptionActionState } from './constants'

const initial: SubscriptionActionState = { status: 'idle' }

const problemText = (state: SubscriptionActionState) =>
  state.status === 'invalid'
    ? 'This link is not valid, or it has already been used.'
    : state.status === 'unavailable'
      ? 'We could not do that just now. Please try again in a few minutes.'
      : undefined

export function ConfirmSubscription({ token }: Readonly<{ token: string }>) {
  const [state, action, pending] = useActionState(confirmSubscription, initial)
  if (state.status === 'done') {
    return (
      <div className={styles.statusPanel} role="status">
        <h2>You are subscribed</h2>
        <p>Thank you. Every email has an unsubscribe link, should you ever change your mind.</p>
        <Link href={routes.marketplace} className="button button--outline">
          Browse the marketplace
        </Link>
      </div>
    )
  }
  const problem = problemText(state)
  return (
    <form action={action} className={styles.statusPanel}>
      <p>Press the button to start getting new listings and offers by email.</p>
      {problem && (
        <p className="field__error" role="alert">
          {problem}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Confirming…' : 'Yes, subscribe me'}
      </button>
    </form>
  )
}

export function Unsubscribe({ email, e, s }: Readonly<{ email: string; e: string; s: string }>) {
  const [state, action, pending] = useActionState(unsubscribeAction, initial)
  if (state.status === 'done') {
    return (
      <div className={styles.statusPanel} role="status">
        <h2>You are unsubscribed</h2>
        <p>{email} will not get any more promotional emails from us.</p>
      </div>
    )
  }
  const problem = problemText(state)
  return (
    <form action={action} className={styles.statusPanel}>
      <p>Stop promotional emails to {email}?</p>
      {problem && (
        <p className="field__error" role="alert">
          {problem}
        </p>
      )}
      <input type="hidden" name="e" value={e} />
      <input type="hidden" name="s" value={s} />
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
    </form>
  )
}
