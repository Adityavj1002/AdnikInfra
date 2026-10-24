import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import { site } from '@/config/site'
import { env } from '@/security/env'
import { composeAlertEmail, composeLeadEmail, type LeadEmail } from './lead-email'

export type Lead = Readonly<{
  kind: 'enquiry' | 'site-visit'
  topic: string
  ref?: string
  name: string
  phone: string
  email?: string
  preference?: string
  message?: string
  visitDate?: string
  visitSlot?: string
}>

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

type ReplyTo = Readonly<{ name: string; address: string }>

async function send(message: LeadEmail, reference: string, replyTo?: ReplyTo): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      // Address objects, not strings: nothing a visitor typed is run through address parsing.
      from: { name: `${site.name} Website`, address: env.LEADS_FROM ?? env.SMTP_USER ?? env.LEADS_TO },
      to: env.LEADS_TO,
      ...(replyTo ? { replyTo } : {}),
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
    return true
  } catch (error) {
    // Codes only: SMTP error text can echo addresses, and personal data never reaches logs.
    const { code, responseCode } = (error ?? {}) as { code?: string; responseCode?: number }
    console.error(`[lead] email delivery failed ${JSON.stringify({ reference, code, responseCode })}`)
    return false
  }
}

function sendLeadEmail(lead: Lead, reference: string): Promise<boolean> {
  return send(composeLeadEmail(lead, reference), reference, lead.email ? { name: lead.name, address: lead.email } : undefined)
}

/** A "new listings by email" sign-up from the footer. Same modes as deliverLead. */
export async function deliverAlertSignup(email: string, reference: string): Promise<boolean> {
  if (env.LEADS_MODE === 'off') return false
  if (env.LEADS_MODE === 'email') return send(composeAlertEmail(email, reference), reference, { name: email, address: email })
  console.info(`[alerts] ${JSON.stringify({ reference, domain: email.split('@')[1] ?? '' })}`)
  return true
}

/**
 * Delivery boundary for leads. Returns false when no sink is configured or delivery fails,
 * so the form says so honestly instead of pretending. A CRM or WhatsApp Business API can be
 * added here; nothing else in the app changes.
 */
export async function deliverLead(lead: Lead, reference: string): Promise<boolean> {
  if (env.LEADS_MODE === 'off') return false
  if (env.LEADS_MODE === 'email') return sendLeadEmail(lead, reference)

  // Development log: redacted. Full personal data never reaches logs.
  console.info(
    `[lead] ${JSON.stringify({
      reference,
      kind: lead.kind,
      topic: lead.topic,
      ref: lead.ref,
      visitDate: lead.visitDate,
      visitSlot: lead.visitSlot,
      name: `${lead.name.slice(0, 1)}…`,
      phone: `…${lead.phone.slice(-2)}`,
      hasEmail: Boolean(lead.email),
    })}`,
  )
  return true
}

/** Short, human-friendly reference: ADN-7F3K2Q. */
export function newReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `ADN-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`
}
