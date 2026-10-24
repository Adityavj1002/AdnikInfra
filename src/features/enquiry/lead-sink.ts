import 'server-only'
import { env } from '@/security/env'

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
 * Delivery boundary for leads. Returns false when no sink is configured, so the form can
 * say so honestly instead of pretending. Production wires a CRM, WhatsApp Business API or
 * transactional email here; nothing else in the app changes.
 */
export async function deliverLead(lead: Lead, reference: string): Promise<boolean> {
  if (env.LEADS_MODE === 'off') return false

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

/** Short, human-friendly reference: VB-7F3K2Q. */
export function newReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `VB-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`
}
