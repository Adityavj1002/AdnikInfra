import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import { site } from '@/config/site'
import { env } from '@/security/env'
import type { RenderedEmail } from './layout'

let transporter: Transporter | undefined

/** One SMTP transport per server process, created on first use. */
function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // 465 is TLS from the first byte; any other port must upgrade with STARTTLS or fail.
    secure: env.SMTP_PORT === 465,
    requireTLS: env.SMTP_PORT !== 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    tls: { minVersion: 'TLSv1.2' },
    // A slow mail server must not hold the visitor's request open.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
  return transporter
}

export type Address = Readonly<{ name?: string; address: string }>

export type Outgoing = Readonly<{
  to: Address | readonly Address[]
  message: RenderedEmail
  replyTo?: Address
  /** Extra headers, e.g. List-Unsubscribe on promotional mail. */
  headers?: Readonly<Record<string, string>>
  /** For logs: a reference, never personal data. */
  tag: string
}>

export type OutboxEntry = Readonly<{ to: readonly string[]; subject: string; text: string; at: string }>

// Development and e2e only (memory marketplace + log mode): recent mail, readable through
// /api/dev/outbox so tests can follow a confirmation link. Never filled in email mode.
const outboxHolder = globalThis as typeof globalThis & { __adnikOutbox?: OutboxEntry[] }

export function devOutbox(): readonly OutboxEntry[] {
  return outboxHolder.__adnikOutbox ?? []
}

const recipients = (to: Outgoing['to']): readonly Address[] => (Array.isArray(to) ? to : [to as Address])

/**
 * The one way the site sends mail. LEADS_MODE decides: "email" sends over SMTP, "log" writes a
 * redacted line (and keeps a dev outbox in memory mode), "off" sends nothing. Returns false
 * when nothing was delivered, so callers can say so honestly.
 */
export async function sendEmail({ to, message, replyTo, headers, tag }: Outgoing): Promise<boolean> {
  if (env.LEADS_MODE === 'off') return false
  const list = recipients(to)
  if (list.length === 0) return false

  if (env.LEADS_MODE === 'log') {
    // Tag and count only: subjects and addresses carry personal data.
    console.info(`[mail] ${JSON.stringify({ tag, recipients: list.length })}`)
    if (env.MARKETPLACE_MODE === 'memory') {
      const outbox = (outboxHolder.__adnikOutbox ??= [])
      outbox.unshift({ to: list.map((a) => a.address), subject: message.subject, text: message.text, at: new Date().toISOString() })
      outbox.length = Math.min(outbox.length, 100)
    }
    return true
  }

  try {
    await getTransporter().sendMail({
      // Address objects, not strings: nothing a visitor typed is run through address parsing.
      from: { name: site.name, address: env.LEADS_FROM ?? env.SMTP_USER ?? env.LEADS_TO },
      to: list.map((a) => ({ name: a.name ?? '', address: a.address })),
      ...(replyTo ? { replyTo: { name: replyTo.name ?? '', address: replyTo.address } } : {}),
      subject: message.subject,
      text: message.text,
      html: message.html,
      ...(headers ? { headers: { ...headers } } : {}),
    })
    return true
  } catch (error) {
    // Codes only: SMTP error text can echo addresses, and personal data never reaches logs.
    const { code, responseCode } = (error ?? {}) as { code?: string; responseCode?: number }
    console.error(`[mail] delivery failed ${JSON.stringify({ tag, code, responseCode })}`)
    return false
  }
}

/** Where team notifications go: the shared inbox plus any extra addresses. */
export function teamInbox(): Address {
  return { name: `${site.name} team`, address: env.LEADS_TO }
}
