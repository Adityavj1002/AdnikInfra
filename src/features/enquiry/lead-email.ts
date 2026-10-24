import 'server-only'
import { site } from '@/config/site'
import { preferenceLabels, topicLabels, visitSlotLabels, type ContactPreference, type EnquiryTopic, type VisitSlot } from './constants'
import type { Lead } from './lead-sink'

export type LeadEmail = Readonly<{ subject: string; text: string; html: string }>

const ESCAPES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Everything a visitor typed is escaped before it touches the HTML body. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch)
}

/** Header values must be one line: a CR or LF would let input forge extra headers. */
export function headerSafe(value: string): string {
  return value.replace(/[\r\n\u2028\u2029]+/g, ' ').trim()
}

const submittedFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
})

function label<K extends string>(labels: Readonly<Record<K, string>>, key: string | undefined): string | undefined {
  if (!key) return undefined
  return (labels as Readonly<Record<string, string>>)[key] ?? key
}

/** Notice to the team that someone wants new listings by email. */
export function composeAlertEmail(email: string, reference: string, submittedAt: Date = new Date()): LeadEmail {
  const when = `${submittedFormat.format(submittedAt)} IST`
  return {
    subject: headerSafe(`Listing alerts sign-up: ${email} [${reference}]`).slice(0, 200),
    text: [
      `Listing alerts sign-up from the ${site.name} website`,
      '',
      `Email: ${email}`,
      `Reference: ${reference}`,
      `Submitted: ${when}`,
      '',
      'Add them to your new-listings list. If they reply "stop", remove them.',
    ].join('\n'),
    html: `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#fbf8f2;font-family:Arial,Helvetica,sans-serif;color:#121c2c;">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #ebe4d3;border-top:3px solid #b8913a;border-collapse:collapse;">
<tr><td style="padding:20px 24px;font-size:14px;line-height:1.6;">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7c5e1a;">${escapeHtml(site.name)} website</p>
<h1 style="margin:0 0 16px;font-size:20px;">Listing alerts sign-up</h1>
<p style="margin:0;"><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Reference:</strong> ${escapeHtml(reference)}<br><strong>Submitted:</strong> ${escapeHtml(when)}</p>
</td></tr></table>
</body></html>`,
  }
}

/** The sales team's copy of a lead: plain text for any client, HTML for a readable layout. */
export function composeLeadEmail(lead: Lead, reference: string, submittedAt: Date = new Date()): LeadEmail {
  const kind = lead.kind === 'site-visit' ? 'Site visit request' : 'New enquiry'
  const visit = [lead.visitDate, label<VisitSlot>(visitSlotLabels, lead.visitSlot)].filter(Boolean).join(', ')

  const rows: readonly (readonly [string, string | undefined])[] = [
    ['Reference', reference],
    ['Topic', label<EnquiryTopic>(topicLabels, lead.topic)],
    ['About', lead.ref],
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Contact by', label<ContactPreference>(preferenceLabels, lead.preference)],
    ['Visit', visit || undefined],
    ['Submitted', `${submittedFormat.format(submittedAt)} IST`],
  ]
  const filled = rows.filter((row): row is readonly [string, string] => Boolean(row[1]))

  const subject = headerSafe(`${kind}: ${lead.name}${lead.ref ? `, ${lead.ref}` : ''} [${reference}]`).slice(0, 200)

  const text = [
    `${kind} from the ${site.name} website`,
    '',
    ...filled.map(([key, value]) => `${key}: ${value}`),
    ...(lead.message ? ['', 'Message:', lead.message] : []),
    '',
    lead.email ? 'Reply to this email to answer them directly.' : 'No email given: call or WhatsApp them.',
  ].join('\n')

  const cell = 'padding:8px 12px;border-bottom:1px solid #ebe4d3;vertical-align:top;'
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#fcfaf5;font-family:Arial,Helvetica,sans-serif;color:#17140f;">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #ebe4d3;border-top:3px solid #b8913a;border-collapse:collapse;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7c5e1a;">${escapeHtml(site.name)} website</p>
<h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(kind)}</h1>
<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;">
${filled.map(([key, value]) => `<tr><th align="left" style="${cell}width:120px;color:#6e665a;font-weight:normal;">${escapeHtml(key)}</th><td style="${cell}">${escapeHtml(value)}</td></tr>`).join('\n')}
</table>
${lead.message ? `<p style="margin:16px 0 4px;color:#6e665a;font-size:14px;">Message</p><p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>` : ''}
</td></tr></table>
</body></html>`

  return { subject, text, html }
}
