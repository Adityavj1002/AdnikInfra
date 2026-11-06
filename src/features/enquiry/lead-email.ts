import 'server-only'
import { site } from '@/config/site'
import { renderEmail, type RenderedEmail } from '@/features/email/layout'
import { formatPhone } from '@/lib/format'
import { nextSteps, preferenceLabels, topicLabels, visitSlotLabels, type ContactPreference, type EnquiryTopic, type VisitSlot } from './constants'
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

const visitDateFormat = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** The customer's copy: what we received, their reference, and what happens next. */
export function composeLeadReceipt(lead: Lead, reference: string, submittedAt: Date = new Date()): LeadEmail {
  const visit = lead.kind === 'site-visit'
  const firstName = lead.name.split(' ')[0] || lead.name
  const visitDay = lead.visitDate ? visitDateFormat.format(new Date(`${lead.visitDate}T00:00:00Z`)) : undefined
  const visitWhen = [visitDay, label<VisitSlot>(visitSlotLabels, lead.visitSlot)].filter(Boolean).join(', ')
  const contactBy = label<ContactPreference>(preferenceLabels, lead.preference)
  const [callStep, meetStep, promise] = visit ? nextSteps.visit : nextSteps.default

  return renderEmail({
    subject: visit ? `Your site visit request is in [${reference}]` : `We have your enquiry, ${firstName} [${reference}]`,
    preheader: `Reference ${reference}. ${site.contact.responseTime}`,
    eyebrow: visit ? 'Site visit request' : 'Enquiry received',
    title: `Thank you, ${firstName}. We have it.`,
    blocks: [
      {
        type: 'p',
        text: visit
          ? `Your request to visit${lead.ref ? ` ${lead.ref}` : ' a project'} has reached our team. ${site.contact.responseTime}`
          : `Your enquiry has reached the ${site.name} team${lead.ref ? ` about ${lead.ref}` : ''}. ${site.contact.responseTime}`,
      },
      { type: 'reference', label: 'Your reference', value: reference, note: 'Quote it whenever you call, WhatsApp or write to us.' },
      { type: 'heading', text: 'What happens next' },
      {
        type: 'steps',
        steps: [
          { label: visit ? 'Request received' : 'Enquiry received', detail: `${submittedFormat.format(submittedAt)} IST`, state: 'done' },
          { label: visit ? 'We confirm your visit' : 'We get back to you', detail: callStep, state: 'current' },
          { label: visit ? 'Your site visit' : 'Meeting or site visit', detail: meetStep, state: 'next' },
        ],
      },
      { type: 'heading', text: 'What you sent us' },
      {
        type: 'rows',
        rows: [
          ['Topic', label<EnquiryTopic>(topicLabels, lead.topic)],
          ['About', lead.ref],
          ['Preferred visit', visitWhen || undefined],
          ['Name', lead.name],
          ['Phone', formatPhone(lead.phone)],
          ['Email', lead.email],
          ['Contact by', contactBy],
        ],
      },
      ...(lead.message ? [{ type: 'quote' as const, label: 'Your message', text: lead.message }] : []),
      ...(promise ? [{ type: 'note' as const, text: promise }] : []),
      { type: 'contact', title: 'Need us sooner?' },
    ],
    reason: `You received this because you sent an enquiry on the ${site.name} website. If that wasn't you, ignore this email.`,
  })
}
