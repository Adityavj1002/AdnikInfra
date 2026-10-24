'use client'

import { ArrowRight, BellRing } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import { routes } from '@/lib/routes'
import { subscribeAlerts } from './actions'
import { initialAlertsState, type AlertsState } from './constants'
import styles from './Alerts.module.css'

const messages: Readonly<Record<AlertsState['status'], string>> = {
  idle: '',
  success: 'Thank you. New listings will reach your inbox first.',
  error: 'Please enter a valid email address, like name@example.com.',
  unavailable: 'We couldn’t sign you up just now. Please try again in a few minutes.',
  'rate-limited': 'Too many attempts. Please try again in a few minutes.',
}

/** Works without JavaScript too: a plain form post to the server action. */
export function ListingAlerts() {
  const [state, action, pending] = useActionState(subscribeAlerts, initialAlertsState)
  const invalid = state.status === 'error'

  return (
    <form action={action} className={styles.form} noValidate>
      <p className={styles.title}>
        <BellRing aria-hidden="true" className="icon" strokeWidth={1.75} /> New listings, first
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
          defaultValue={invalid ? state.email : ''}
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
        Plots, homes and land in Jaipur and nearby, by email. Reply “stop” any time. <Link href={routes.privacy}>Privacy</Link>
      </p>
      <p id="alerts-status" role="status" className={`${styles.status} ${invalid ? styles.statusError : ''}`}>
        {messages[state.status]}
      </p>
    </form>
  )
}
