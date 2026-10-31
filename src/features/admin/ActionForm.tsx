'use client'

import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import { initialAdminFormState, type AdminFormState } from './constants'
import styles from './admin.module.css'

type Props = Readonly<{
  action: (previous: AdminFormState, form: FormData) => Promise<AdminFormState>
  submitLabel: string
  pendingLabel?: string
  /** Asked before a destructive action. */
  confirm?: string
  variant?: 'primary' | 'outline' | 'danger'
  children?: ReactNode
  className?: string
}>

/**
 * A server action with its message beside the button. Dispatched by hand so a failed attempt
 * keeps what was typed (React resets a form after a plain `action`); cleared only on success.
 */
export function ActionForm({ action, submitLabel, pendingLabel, confirm, variant = 'primary', children, className }: Props) {
  const [state, dispatch, pending] = useActionState(action, initialAdminFormState)
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'ok') form.current?.reset()
  }, [state])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (confirm && !window.confirm(confirm)) return
    const data = new FormData(event.currentTarget)
    startTransition(() => dispatch(data))
  }

  const buttonClass = variant === 'primary' ? 'button' : variant === 'outline' ? 'button button--outline' : `button button--outline ${styles.danger}`

  return (
    <form ref={form} action={dispatch} onSubmit={handleSubmit} className={className ?? styles.form}>
      {children}
      <div className={styles.formFoot}>
        <button type="submit" className={buttonClass} disabled={pending}>
          {pending ? (pendingLabel ?? 'Working…') : submitLabel}
        </button>
        {state.status !== 'idle' && (
          <p role={state.status === 'error' ? 'alert' : 'status'} className={state.status === 'error' ? 'field__error' : styles.ok}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
