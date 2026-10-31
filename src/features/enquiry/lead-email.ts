import 'server-only'
import { renderEmail, type RenderedEmail } from '@/features/email/layout'
import { preferenceLabels, topicLabels, visitSlotLabels, type ContactPreference, type EnquiryTopic, type VisitSlot } from './constants'
import type { Lead } from './lead-sink'

export { escapeHtml, headerSafe } from '@/features/email/layout'

export type LeadEmail = RenderedEmail

const submittedFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
})

function label<K extends string>(labels: Readonly<Record<K, string>>, key: string | undefined): string | undefined {
  if (!key) return undefined
  return (labels as Readonly<Record<string, string>>)[key] ?? key
}

/** The sales team's copy of a lead, in the shared branded layout with a plain-text twin. */
export function composeLeadEmail(lead: Lead, reference: string, submittedAt: Date = new Date()): LeadEmail {
  const kind = lead.kind === 'site-visit' ? 'Site visit request' : 'New enquiry'
  const visit = [lead.visitDate, label<VisitSlot>(visitSlotLabels, lead.visitSlot)].filter(Boolean).join(', ')

  return renderEmail({
    subject: `${kind}: ${lead.name}${lead.ref ? `, ${lead.ref}` : ''} [${reference}]`,
    preheader: `${lead.name} · ${label<EnquiryTopic>(topicLabels, lead.topic) ?? lead.topic}`,
    eyebrow: 'Website enquiry',
    title: kind,
    blocks: [
      {
        type: 'rows',
        rows: [
          ['Reference', reference],
          ['Topic', label<EnquiryTopic>(topicLabels, lead.topic)],
          ['About', lead.ref],
          ['Name', lead.name],
          ['Phone', lead.phone],
          ['Email', lead.email],
          ['Contact by', label<ContactPreference>(preferenceLabels, lead.preference)],
          ['Visit', visit || undefined],
          ['Submitted', `${submittedFormat.format(submittedAt)} IST`],
        ],
      },
      ...(lead.message ? [{ type: 'quote' as const, label: 'Message', text: lead.message }] : []),
      {
        type: 'note',
        text: lead.email ? 'Reply to this email to answer them directly.' : 'No email given: call or WhatsApp them.',
      },
    ],
    reason: 'Sent from the enquiry form on the website.',
  })
}
