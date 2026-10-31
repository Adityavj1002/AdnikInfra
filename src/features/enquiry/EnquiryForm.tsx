'use client'

import { Send } from 'lucide-react'
import Link from 'next/link'
import { startTransition, useActionState, useState, type FocusEvent, type FormEvent } from 'react'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { submitEnquiry } from './actions'
import {
  CONTACT_PREFERENCES,
  ENQUIRY_TOPICS,
  VISIT_SLOTS,
  VISIT_WINDOW_DAYS,
  indiaDay,
  initialFormState,
  preferenceLabels,
  topicLabels,
  visitSlotLabels,
  type EnquiryTopic,
  type FieldErrors,
} from './constants'
import { ConsentField, ErrorSummary, Field, Honeypot, StatusPanel } from './FormParts'
import { CHECKED_FIELDS, needsMessage, validateEnquiry } from './validation'
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

type CheckedField = (typeof CHECKED_FIELDS)[number]
const isChecked = (name: string): name is CheckedField => (CHECKED_FIELDS as readonly string[]).includes(name)

/** The form's current values, as the browser would submit them. */
function readForm(form: HTMLFormElement): Partial<Record<string, string>> {
  const values: Partial<Record<string, string>> = {}
  for (const [key, value] of new FormData(form)) if (typeof value === 'string') values[key] = value
  return values
}

/**
 * One form for every enquiry. Works without JavaScript (the server action handles a plain
 * POST); with JavaScript, errors and confirmation appear without a page load.
 */
export function EnquiryForm({ defaultTopic = 'buy', about, variant = 'full' }: Props) {
  const [state, action, pending] = useActionState(submitEnquiry, initialFormState)
  const compact = variant === 'compact'
  const serverErrors: FieldErrors = state.status === 'error' ? state.errors : {}
  const values = state.status === 'error' ? state.values : {}
  const initialTopic = values.topic ?? (compact ? 'site-visit' : defaultTopic)

  // Browser checks layer over the server's answer: an entry here (even undefined) replaces it.
  const [live, setLive] = useState<FieldErrors>({})
  const [summary, setSummary] = useState<FieldErrors | null>(null)
  const [topicNow, setTopicNow] = useState<string>(initialTopic)
  const [seenState, setSeenState] = useState(state)
  if (seenState !== state) {
    // A fresh server answer starts the checks over.
    setSeenState(state)
    setLive({})
    setSummary(null)
    setTopicNow(initialTopic)
  }

  if (state.status === 'success') {
    return <StatusPanel state={state} nextSteps={state.topic === 'site-visit' ? nextSteps.visit : nextSteps.default} />
  }

  const errors: FieldErrors = { ...serverErrors, ...live }
  const summaryErrors = summary ?? (state.status === 'error' ? serverErrors : null)
  const topic = initialTopic
  const preference = values.preference ?? 'call'
  const messageRequired = needsMessage(topicNow)

  const recheck = (form: HTMLFormElement, fields: readonly CheckedField[]) => {
    const found = validateEnquiry(readForm(form))
    setLive((previous) => ({ ...previous, ...Object.fromEntries(fields.map((field) => [field, found[field]])) }))
  }

  /** Stop a submission the server would only send back, and say what to fix. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const found = validateEnquiry(readForm(event.currentTarget))
    setLive(Object.fromEntries(CHECKED_FIELDS.map((field) => [field, found[field]])))
    // Dispatched by hand: React resets a form after a plain action, which clears selects and radios.
    event.preventDefault()
    if (Object.keys(found).length > 0) {
      setSummary(found)
    } else {
      setSummary(null)
      const data = new FormData(event.currentTarget)
      startTransition(() => action(data))
    }
  }

  /** Check a field once the visitor leaves it, but don't flag one they only tabbed past. */
  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const field = event.target
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
    const { name, value } = field
    if (!isChecked(name) || name === 'consent') return
    if (value.trim() === '' && !errors[name]) return
    recheck(event.currentTarget, [name])
  }

  /** Clear an error as soon as it's fixed; topic and contact choice change what's required. */
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target
    if (target instanceof HTMLInputElement) {
      if (target.name === 'phone') target.value = target.value.replace(/[^\d+\s()-]/g, '')
      if (target.name === 'topic') setTopicNow(target.value)
    }
    const flagged = CHECKED_FIELDS.filter((field) => errors[field])
    if (flagged.length > 0) recheck(event.currentTarget, flagged)
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      onChange={handleChange}
      className={`${styles.form} ${compact ? styles.compact : ''}`}
      noValidate
    >
      {(state.status === 'unavailable' || state.status === 'rate-limited') && (
        <StatusPanel state={state} nextSteps={nextSteps.default} />
      )}
      {summaryErrors && Object.keys(summaryErrors).length > 0 && <ErrorSummary errors={summaryErrors} labels={labels} />}

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
            <input
              {...control}
              className="input"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              maxLength={100}
              required
              defaultValue={values.name}
            />
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
              required
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
            <input {...control} className="input" type="date" min={indiaDay(0)} max={indiaDay(VISIT_WINDOW_DAYS)} defaultValue={values.visitDate} />
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
            optional={!messageRequired}
            hint={topicNow === 'proposal' ? 'Location, type of project and your timeline.' : 'Budget, preferred area, plot size, or anything else that helps us help you.'}
            error={errors.message}
          >
            {(control) => (
              <textarea {...control} className="textarea" rows={5} maxLength={2000} required={messageRequired} defaultValue={values.message} />
            )}
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
