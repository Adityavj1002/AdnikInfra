'use client'

import { ArrowRight, BellRing } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useState, type ChangeEvent, type FormEvent } from 'react'
import { isEmail as isValidEmail } from '@/features/enquiry/validation'
import { routes } from '@/lib/routes'
import { subscribeAlerts } from './actions'
import { initialAlertsState, type AlertsState } from './constants'
import styles from './Alerts.module.css'

const messages: Readonly<Record<AlertsState['status'], string>> = {
  idle: '',
  success: 'Almost done: check your inbox and click the link to confirm.',
  error: 'Please enter a valid email address, like name@example.com.',
  unavailable: 'We couldn’t sign you up just now. Please try again in a few minutes.',
  'rate-limited': 'Too many attempts. Please try again in a few minutes.',
}

/** Works without JavaScript too: a plain form post to the server action. */
export function ListingAlerts() {
  const [state, action, pending] = useActionState(subscribeAlerts, initialAlertsState)
  // Caught in the browser before a round trip; a fresh server answer clears it.
  const [badEmail, setBadEmail] = useState(false)
  const [seenState, setSeenState] = useState(state)
  if (seenState !== state) {
    setSeenState(state)
    setBadEmail(false)
  }
  const invalid = badEmail || state.status === 'error'
  const isEmail = (value: string) => isValidEmail(value.trim())

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const email = new FormData(event.currentTarget).get('email')
    if (typeof email !== 'string' || !isEmail(email)) {
      event.preventDefault()
      setBadEmail(true)
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (badEmail && isEmail(event.target.value)) setBadEmail(false)
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={styles.form} noValidate>
      <p className={styles.title}>
        <BellRing aria-hidden="true" className="icon" strokeWidth={1.75} /> Subscribe for new listings and offers
      </p>
      <label htmlFor="alerts-email" className={styles.label}>
        Your email
      </label>
      <div className={styles.row}>
        <input
          id="alerts-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={state.status === 'error' ? state.email : ''}
          onChange={handleChange}
          aria-invalid={invalid || undefined}
          aria-describedby="alerts-note alerts-status"
          className={`input ${styles.input}`}
        />
        <button type="submit" className={`button ${styles.submit}`} disabled={pending}>
          {pending ? 'Sending…' : 'Subscribe'}
          <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </button>
      </div>
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="alerts-website">Leave this field empty</label>
        <input id="alerts-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p id="alerts-note" className={styles.note}>
        A few emails a month at most. Unsubscribe any time. <Link href={routes.privacy}>Privacy</Link>
      </p>
      <p id="alerts-status" role="status" className={`${styles.status} ${invalid ? styles.statusError : ''}`}>
        {badEmail ? messages.error : messages[state.status]}
      </p>
    </form>
  )
}
