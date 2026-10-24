'use client'

import { Send } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { submitEnquiry } from './actions'
import {
  CONTACT_PREFERENCES,
  ENQUIRY_TOPICS,
  VISIT_SLOTS,
  VISIT_WINDOW_DAYS,
  initialFormState,
  preferenceLabels,
  topicLabels,
  visitSlotLabels,
  type EnquiryTopic,
} from './constants'
import { ConsentField, ErrorSummary, Field, Honeypot, StatusPanel } from './FormParts'
import styles from './Form.module.css'

const labels = {
  topic: 'Topic',
  name: 'Full name',
  phone: 'Mobile number',
  email: 'Email',
  preference: 'How should we contact you?',
  visitDate: 'Preferred date',
  visitSlot: 'Preferred time',
  message: 'Message',
  consent: 'Consent',
} as const

const nextSteps: Readonly<Record<'visit' | 'default', readonly string[]>> = {
  visit: [
    'Our team calls you to confirm the date, time and meeting point.',
    'A project specialist walks you through the site, plans and prices.',
    'No booking amount is taken during a site visit.',
  ],
  default: [
    'A member of our team reads your message and calls you back.',
    'If it helps, we arrange a site visit or an office meeting.',
    'Nothing is booked or charged until you confirm in writing.',
  ],
}

type Props = Readonly<{
  defaultTopic?: EnquiryTopic
  /** Project or property the visitor came from. */
  about?: Readonly<{ slug: string; name: string }>
  /** Compact: a short site-visit card for project and property pages. */
  variant?: 'full' | 'compact'
}>

function isoDay(offsetDays: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

/**
 * One form for every enquiry. Works without JavaScript (the server action handles a plain
 * POST); with JavaScript, errors and confirmation appear without a page load.
 */
export function EnquiryForm({ defaultTopic = 'buy', about, variant = 'full' }: Props) {
  const [state, action, pending] = useActionState(submitEnquiry, initialFormState)
  const compact = variant === 'compact'

  if (state.status === 'success') {
    return <StatusPanel state={state} nextSteps={state.topic === 'site-visit' ? nextSteps.visit : nextSteps.default} />
  }

  const errors = state.status === 'error' ? state.errors : {}
  const values = state.status === 'error' ? state.values : {}
  const topic = values.topic ?? (compact ? 'site-visit' : defaultTopic)
  const preference = values.preference ?? 'call'

  return (
    <form action={action} className={`${styles.form} ${compact ? styles.compact : ''}`} noValidate>
      {(state.status === 'unavailable' || state.status === 'rate-limited') && (
        <StatusPanel state={state} nextSteps={nextSteps.default} />
      )}
      {state.status === 'error' && <ErrorSummary errors={errors} labels={labels} />}

      {about && (
        <p className={styles.context}>
          Enquiring about <strong>{about.name}</strong>
          <input type="hidden" name="ref" value={about.slug} />
        </p>
      )}

      {compact ? (
        <input type="hidden" name="topic" value="site-visit" />
      ) : (
        <fieldset className="fieldset" aria-describedby={errors.topic ? 'field-topic-error' : undefined}>
          <legend className={`field__label ${styles.legend}`}>What can we help with?</legend>
          {errors.topic && (
            <p id="field-topic-error" className="field__error">
              {errors.topic}
            </p>
          )}
          <div className={styles.pills}>
            {ENQUIRY_TOPICS.map((value, index) => (
              <label key={value} className={styles.pill}>
                <input
                  type="radio"
                  name="topic"
                  value={value}
                  defaultChecked={topic === value}
                  {...(index === 0 ? { id: 'field-topic' } : {})}
                />
                <span>{topicLabels[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.row}>
        <Field name="name" label={labels.name} error={errors.name}>
          {(control) => (
            <input {...control} className="input" type="text" autoComplete="name" enterKeyHint="next" maxLength={100} defaultValue={values.name} />
          )}
        </Field>
        <Field name="phone" label={labels.phone} error={errors.phone}>
          {(control) => (
            <input
              {...control}
              className="input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              maxLength={20}
              placeholder="98290 12345"
              defaultValue={values.phone}
            />
          )}
        </Field>
      </div>

      {/* Shown for site visits; CSS :has() toggles it, so it works without JavaScript too. */}
      <div className={`${styles.row} ${styles.visit}`}>
        <Field name="visitDate" label={labels.visitDate} optional error={errors.visitDate}>
          {(control) => (
            <input {...control} className="input" type="date" min={isoDay(0)} max={isoDay(VISIT_WINDOW_DAYS)} defaultValue={values.visitDate} />
          )}
        </Field>
        <Field name="visitSlot" label={labels.visitSlot} optional error={errors.visitSlot}>
          {(control) => (
            <select {...control} className="select" defaultValue={values.visitSlot ?? ''}>
              <option value="">Any time</option>
              {VISIT_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {visitSlotLabels[slot]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {!compact && (
        <>
          <Field name="email" label={labels.email} optional error={errors.email}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                defaultValue={values.email}
              />
            )}
          </Field>

          <fieldset className="fieldset">
            <legend className={`field__label ${styles.legend}`}>{labels.preference}</legend>
            <div className={styles.pills}>
              {CONTACT_PREFERENCES.map((value) => (
                <label key={value} className={styles.pill}>
                  <input type="radio" name="preference" value={value} defaultChecked={preference === value} />
                  <span>{preferenceLabels[value]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            name="message"
            label={labels.message}
            optional
            hint="Budget, preferred area, plot size, or anything else that helps us help you."
            error={errors.message}
          >
            {(control) => <textarea {...control} className="textarea" rows={5} maxLength={2000} defaultValue={values.message} />}
          </Field>
        </>
      )}

      <ConsentField error={errors.consent} checked={values.consent === 'on'}>
        I agree that {site.name} may call or message me about this enquiry.
      </ConsentField>

      <Honeypot />

      <div className={styles.submit}>
        <button type="submit" className={`button ${compact ? 'button--gold button--block' : ''}`} disabled={pending} aria-disabled={pending}>
          <Send aria-hidden="true" strokeWidth={1.75} />
          {pending ? 'Sending…' : compact ? 'Book a free site visit' : 'Send enquiry'}
        </button>
        <p className={styles.privacy} aria-live="polite">
          {pending ? (
            'Sending your details…'
          ) : (
            <>
              No spam, ever. <Link href={routes.privacy}>Privacy notice</Link>.
            </>
          )}
        </p>
      </div>
    </form>
  )
}
