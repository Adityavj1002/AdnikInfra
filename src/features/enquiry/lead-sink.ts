import 'server-only'
import { sendEmail, teamInbox } from '@/features/email/mailer'
import { env } from '@/security/env'
import { composeLeadEmail } from './lead-email'

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

/**
 * Delivery boundary for leads. Returns false when no sink is configured or delivery fails,
 * so the form says so honestly instead of pretending. A CRM or WhatsApp Business API can be
 * added here; nothing else in the app changes.
 */
export async function deliverLead(lead: Lead, reference: string): Promise<boolean> {
  if (env.LEADS_MODE === 'log') {
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
  }
  return sendEmail({
    to: teamInbox(),
    message: composeLeadEmail(lead, reference),
    replyTo: lead.email ? { name: lead.name, address: lead.email } : undefined,
    tag: `lead ${reference}`,
  })
}

/** Short, human-friendly reference: ADN-7F3K2Q. */
export function newReference(prefix = 'ADN'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`
}
