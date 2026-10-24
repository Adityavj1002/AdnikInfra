'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { site } from '@/config/site'
import type { FieldErrors, FormState } from './constants'
import styles from './Form.module.css'

export type ControlProps = Readonly<{
  id: string
  name: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}>

/** Label + hint + inline error wired to the control via aria-describedby. */
export function Field({
  name,
  label,
  hint,
  optional,
  error,
  children,
}: Readonly<{
  name: string
  label: string
  hint?: string
  optional?: boolean
  error?: string
  children: (control: ControlProps) => ReactNode
}>) {
  const id = `field-${name}`
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} {optional && <span className="field__optional">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
      {children({
        id,
        name,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(error ? { 'aria-invalid': true as const } : {}),
      })}
    </div>
  )
}

/** GOV.UK-style error summary: receives focus, links jump to and focus each field. */
export function ErrorSummary({ errors, labels }: Readonly<{ errors: FieldErrors; labels: Readonly<Record<string, string>> }>) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [errors])
  const entries = Object.entries(errors)
  return (
    <div ref={ref} tabIndex={-1} className={styles.summary} role="alert" aria-labelledby="error-summary-title">
      <h2 id="error-summary-title" className={styles.summaryTitle}>
        Please check {entries.length === 1 ? 'one detail' : `${entries.length} details`}
      </h2>
      <ul className={styles.summaryList}>
        {entries.map(([name, message]) => (
          <li key={name}>
            <a
              href={`#field-${name}`}
              onClick={(event) => {
                const target = document.getElementById(`field-${name}`)
                if (target) {
                  event.preventDefault()
                  target.focus()
                }
              }}
            >
              {labels[name] ? `${labels[name]}: ` : ''}
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StatusPanel({ state, nextSteps }: Readonly<{ state: FormState; nextSteps: readonly string[] }>) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [state])

  if (state.status === 'success') {
    return (
      <div className={styles.panel} role="status">
        <h2 ref={heading} tabIndex={-1} className={styles.panelTitle}>
          Thank you, {state.firstName}.
        </h2>
        <p>
          Your reference is <strong className="data">{state.reference}</strong>. {site.contact.responseTime}
        </p>
        <ol className={styles.steps}>
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    )
  }

  const message =
    state.status === 'rate-limited'
      ? 'We’ve received several messages from this connection. Please wait a few minutes and try again.'
      : 'Your message didn’t reach us because of a problem on our side, not yours. Please try again in a few minutes.'

  return (
    <div className={`${styles.panel} ${styles.panelWarn}`} role="alert">
      <h2 ref={heading} tabIndex={-1} className={styles.panelTitle}>
        We couldn’t send that just now
      </h2>
      <p>{message}</p>
      {site.contact.email && (
        <p>
          You can also email <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
      )}
    </div>
  )
}

/** Hidden from people (and from assistive tech); bots that fill every field reveal themselves. */
export function Honeypot() {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label htmlFor="field-website">Leave this field empty</label>
      <input id="field-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  )
}

export function ConsentField({
  error,
  checked,
  children,
}: Readonly<{ error?: string; checked?: boolean; children: ReactNode }>) {
  return (
    <div className="field">
      {error && (
        <p id="field-consent-error" className="field__error">
          {error}
        </p>
      )}
      <label className="choice" htmlFor="field-consent">
        <input
          id="field-consent"
          name="consent"
          type="checkbox"
          defaultChecked={checked}
          {...(error ? { 'aria-invalid': true, 'aria-describedby': 'field-consent-error' } : {})}
        />
        <span>{children}</span>
      </label>
    </div>
  )
}
