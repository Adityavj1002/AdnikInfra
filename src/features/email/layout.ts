import 'server-only'
import { site } from '@/config/site'
import { formatPhone } from '@/lib/format'
import { env } from '@/security/env'

/**
 * One branded layout for every email the site sends. Table-based with inline styles, because
 * that is what Gmail, Outlook and Apple Mail all render the same. Every value is escaped here,
 * so templates pass plain text and never build HTML from visitor input.
 */

export type RenderedEmail = Readonly<{ subject: string; text: string; html: string }>

const ESCAPES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch)
}

/** Header values must be one line: a CR or LF would let input forge extra headers. */
export function headerSafe(value: string): string {
  return value.replace(/[\r\n\u2028\u2029]+/g, ' ').trim()
}

export function subjectLine(value: string): string {
  return headerSafe(value).slice(0, 200)
}

/** Only our own absolute https/http links go into buttons and anchors. */
function safeUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : '#'
}

const NAVY = '#172036'
const NAVY_SOFT = '#24304d'
const GOLD = '#c49a45'
const GOLD_INK = '#7a5718'
const GOLD_TINT = '#fbf6ea'
const CREAM = '#f7f5ef'
const BORDER = '#e6e0d1'
const MUTED = '#5a6275'
const SUCCESS = '#2f7d4f'
const FONT = "Arial,'Helvetica Neue',Helvetica,sans-serif"
const SERIF = "Georgia,'Times New Roman',serif"

export type StepState = 'done' | 'current' | 'next'

export type EmailBlock =
  | Readonly<{ type: 'p'; text: string }>
  | Readonly<{ type: 'rows'; rows: readonly (readonly [string, string | undefined | null])[] }>
  | Readonly<{ type: 'quote'; label: string; text: string }>
  | Readonly<{ type: 'button'; label: string; url: string }>
  | Readonly<{ type: 'list'; items: readonly string[] }>
  | Readonly<{ type: 'cards'; cards: readonly Readonly<{ title: string; meta: string; url: string; image?: string }>[] }>
  | Readonly<{ type: 'note'; text: string }>
  | Readonly<{ type: 'heading'; text: string }>
  /** The number a customer quotes when they get in touch. */
  | Readonly<{ type: 'reference'; label: string; value: string; note?: string }>
  /** Where things stand: finished steps, the one in progress, and what comes next. */
  | Readonly<{ type: 'steps'; steps: readonly Readonly<{ label: string; detail?: string; state: StepState }>[] }>
  /** Call, WhatsApp and email buttons from the site's contact details. */
  | Readonly<{ type: 'contact'; title?: string }>

export type EmailContent = Readonly<{
  subject: string
  /** Inbox preview line, hidden in the body. */
  preheader: string
  eyebrow?: string
  title: string
  blocks: readonly EmailBlock[]
  /** Promotional mail must carry a working unsubscribe link. */
  unsubscribeUrl?: string
  /** Why the reader got this, shown in the footer. */
  reason: string
}>

type ContactLink = Readonly<{ label: string; detail: string; url: string }>

function contactLinks(): readonly ContactLink[] {
  const { phone, whatsapp, email } = site.contact
  return [
    ...(phone ? [{ label: 'Call us', detail: formatPhone(phone), url: `tel:${phone}` }] : []),
    ...(whatsapp ? [{ label: 'WhatsApp', detail: 'Chat with our team', url: `https://wa.me/${whatsapp.replace(/\D/g, '')}` }] : []),
    ...(email ? [{ label: 'Email', detail: email, url: `mailto:${email}` }] : []),
  ]
}

const STEP_MARK: Readonly<Record<StepState, string>> = { done: '&#10003;', current: '&#9679;', next: '' }

function stepsHtml(steps: Extract<EmailBlock, { type: 'steps' }>['steps']): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
${steps
  .map((step, i) => {
    const last = i === steps.length - 1
    const fill = step.state === 'done' ? SUCCESS : step.state === 'current' ? GOLD : '#ffffff'
    const ring = step.state === 'next' ? BORDER : fill
    const mark = step.state === 'next' ? String(i + 1) : STEP_MARK[step.state]
    const markColour = step.state === 'next' ? MUTED : '#ffffff'
    const labelColour = step.state === 'next' ? MUTED : NAVY
    const badge =
      step.state === 'current'
        ? ` <span style="display:inline-block;margin-left:6px;padding:2px 8px;background:${GOLD_TINT};border:1px solid ${GOLD};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${GOLD_INK};">Now</span>`
        : ''
    return `<tr>
<td width="40" valign="top" style="width:40px;padding:0;">
<div style="width:24px;height:24px;border-radius:14px;background:${fill};border:2px solid ${ring};text-align:center;font-family:${FONT};font-size:13px;font-weight:bold;line-height:24px;color:${markColour};">${mark}</div>
${last ? '' : `<div style="width:15px;height:26px;border-right:2px solid ${step.state === 'done' ? SUCCESS : BORDER};font-size:0;line-height:0;">&nbsp;</div>`}
</td>
<td valign="top" style="padding:4px 0 ${last ? 0 : 14}px;">
<p style="margin:0;font-size:15px;font-weight:bold;line-height:1.4;color:${labelColour};">${escapeHtml(step.label)}${badge}</p>
${step.detail ? `<p style="margin:3px 0 0;font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(step.detail)}</p>` : ''}
</td></tr>`
  })
  .join('\n')}
</table>`
}

function contactHtml(title: string): string {
  const links = contactLinks()
  if (links.length === 0) return ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 8px;background:${NAVY};">
<tr><td colspan="2" style="padding:18px 20px 8px;font-family:${SERIF};font-size:17px;color:#ffffff;">${escapeHtml(title)}</td></tr>
${links
  .map(
    (link, i) => `<tr>
<td width="110" valign="middle" style="width:110px;padding:10px 0 10px 20px;border-top:1px solid ${NAVY_SOFT};${i === links.length - 1 ? 'padding-bottom:18px;' : ''}font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${GOLD};">${escapeHtml(link.label)}</td>
<td valign="middle" style="padding:10px 20px 10px 8px;border-top:1px solid ${NAVY_SOFT};${i === links.length - 1 ? 'padding-bottom:18px;' : ''}"><a href="${escapeHtml(link.url)}" style="font-size:15px;color:#ffffff;text-decoration:none;">${escapeHtml(link.detail)}</a></td>
</tr>`,
  )
  .join('\n')}
</table>
<p style="margin:0 0 4px;font-size:12px;color:${MUTED};">${escapeHtml(site.contact.hours)}</p>`
}

function blockHtml(block: EmailBlock): string {
  switch (block.type) {
    case 'heading':
      return `<p style="margin:8px 0 12px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${GOLD_INK};">${escapeHtml(block.text)}</p>`
    case 'reference':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;background:${GOLD_TINT};border:1px solid ${GOLD};">
<tr><td style="padding:16px 20px;">
<p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${GOLD_INK};">${escapeHtml(block.label)}</p>
<p style="margin:6px 0 0;font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:bold;letter-spacing:2px;color:${NAVY};">${escapeHtml(block.value)}</p>
${block.note ? `<p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(block.note)}</p>` : ''}
</td></tr></table>`
    case 'steps':
      return stepsHtml(block.steps)
    case 'contact':
      return contactHtml(block.title ?? 'Talk to us')
    case 'p':
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${NAVY};">${escapeHtml(block.text)}</p>`
    case 'note':
      return `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(block.text)}</p>`
    case 'rows': {
      const rows = block.rows.filter((row): row is readonly [string, string] => Boolean(row[1]))
      const cell = `padding:10px 12px;border-bottom:1px solid ${BORDER};vertical-align:top;font-size:14px;line-height:1.5;`
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;border-top:1px solid ${BORDER};">
${rows.map(([key, value]) => `<tr><th align="left" style="${cell}width:38%;color:${MUTED};font-weight:normal;">${escapeHtml(key)}</th><td style="${cell}color:${NAVY};">${escapeHtml(value)}</td></tr>`).join('\n')}
</table>`
    }
    case 'quote':
      return `<p style="margin:0 0 6px;font-size:13px;color:${MUTED};">${escapeHtml(block.label)}</p>
<div style="margin:0 0 20px;padding:12px 16px;border-left:3px solid ${GOLD};background:${CREAM};font-size:14px;line-height:1.6;color:${NAVY};white-space:pre-wrap;">${escapeHtml(block.text)}</div>`
    case 'button':
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;"><tr><td style="background:${GOLD};">
<a href="${escapeHtml(safeUrl(block.url))}" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;font-weight:bold;color:${NAVY};text-decoration:none;">${escapeHtml(block.label)}</a>
</td></tr></table>`
    case 'list':
      return `<ul style="margin:0 0 20px;padding-left:20px;font-size:15px;line-height:1.7;color:${NAVY};">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    case 'cards':
      return block.cards
        .map(
          (card) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 12px;border:1px solid ${BORDER};"><tr>
${card.image ? `<td width="140" style="width:140px;padding:0;"><a href="${escapeHtml(safeUrl(card.url))}"><img src="${escapeHtml(safeUrl(card.image))}" width="140" height="105" alt="" style="display:block;width:140px;height:105px;object-fit:cover;border:0;"></a></td>` : ''}
<td style="padding:12px 14px;vertical-align:top;"><a href="${escapeHtml(safeUrl(card.url))}" style="font-size:15px;font-weight:bold;color:${NAVY};text-decoration:none;">${escapeHtml(card.title)}</a>
<p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(card.meta)}</p></td></tr></table>`,
        )
        .join('\n')
  }
}

const STEP_TEXT: Readonly<Record<StepState, string>> = { done: '[done]', current: '[now] ', next: '[next]' }

function blockText(block: EmailBlock): string {
  switch (block.type) {
    case 'heading':
      return block.text.toUpperCase()
    case 'reference':
      return [`${block.label}: ${block.value}`, block.note].filter(Boolean).join('\n')
    case 'steps':
      return block.steps.map((step) => `${STEP_TEXT[step.state]} ${step.label}${step.detail ? `: ${step.detail}` : ''}`).join('\n')
    case 'contact':
      return [block.title ?? 'Talk to us', ...contactLinks().map((link) => `${link.label}: ${link.detail}`), site.contact.hours].join('\n')
    case 'p':
    case 'note':
      return block.text
    case 'rows':
      return block.rows
        .filter((row) => Boolean(row[1]))
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    case 'quote':
      return `${block.label}:\n${block.text}`
    case 'button':
      return `${block.label}: ${block.url}`
    case 'list':
      return block.items.map((item) => `- ${item}`).join('\n')
    case 'cards':
      return block.cards.map((card) => `${card.title}\n${card.meta}\n${card.url}`).join('\n\n')
  }
}

export function renderEmail(content: EmailContent): RenderedEmail {
  const footer = [content.reason, content.unsubscribeUrl ? `Unsubscribe: ${content.unsubscribeUrl}` : '', `${site.name}, ${site.city}, ${site.state}`]
    .filter(Boolean)
    .join('\n')

  const siteHome = new URL('/', env.SITE_URL).href
  const siteHost = new URL(env.SITE_URL).host.replace(/^www\./, '')
  const logoUrl = new URL('/brand/adnik-infra-logo-512.png', env.SITE_URL).href
  const [brandFirst = site.name, ...brandWords] = site.name.toUpperCase().split(' ')
  const brandRest = brandWords.join(' ')
  const footerLinks = [
    ...(site.contact.phone ? [`<a href="tel:${escapeHtml(site.contact.phone)}" style="color:#d5dbea;text-decoration:none;">${escapeHtml(formatPhone(site.contact.phone))}</a>`] : []),
    ...(site.contact.email ? [`<a href="mailto:${escapeHtml(site.contact.email)}" style="color:#d5dbea;text-decoration:none;">${escapeHtml(site.contact.email)}</a>`] : []),
    ...site.business.profiles
      .filter((url) => url.includes('instagram.com'))
      .map((url) => `<a href="${escapeHtml(safeUrl(url))}" style="color:#d5dbea;text-decoration:none;">Instagram</a>`),
  ]
    .map((link) => ` &nbsp;·&nbsp; ${link}`)
    .join('')

  const text = [content.title, '', ...content.blocks.map(blockText).flatMap((t) => [t, '']), '--', footer].join('\n')

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(content.subject)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${FONT};color:${NAVY};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;">
<tr><td style="background:${NAVY};padding:22px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
<td width="48" valign="middle" style="width:48px;padding:0 14px 0 0;"><img src="${escapeHtml(logoUrl)}" width="48" height="48" alt="" style="display:block;width:48px;height:48px;border:0;border-radius:8px;background:#ffffff;"></td>
<td valign="middle"><span style="font-family:${SERIF};font-size:22px;font-weight:bold;letter-spacing:1px;color:#ffffff;">${escapeHtml(brandFirst)} <span style="color:${GOLD};">${escapeHtml(brandRest)}</span></span><br>
<span style="font-size:10px;letter-spacing:3px;color:#aeb8d2;">${escapeHtml(site.tagline.toUpperCase())}</span></td>
</tr></table>
</td></tr>
<tr><td style="height:3px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="background:#ffffff;padding:28px;border:1px solid ${BORDER};border-top:0;">
${content.eyebrow ? `<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${GOLD_INK};">${escapeHtml(content.eyebrow)}</p>` : ''}
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${NAVY};">${escapeHtml(content.title)}</h1>
${content.blocks.map(blockHtml).join('\n')}
</td></tr>
<tr><td style="background:${NAVY_SOFT};padding:16px 28px;font-size:12px;line-height:1.7;color:#d5dbea;">
<a href="${escapeHtml(siteHome)}" style="color:#ffffff;font-weight:bold;text-decoration:none;">${escapeHtml(siteHost)}</a>${footerLinks}
</td></tr>
<tr><td style="padding:16px 28px;font-size:12px;line-height:1.6;color:${MUTED};">
${escapeHtml(content.reason)}${content.unsubscribeUrl ? `<br><a href="${escapeHtml(safeUrl(content.unsubscribeUrl))}" style="color:${GOLD_INK};">Unsubscribe</a>` : ''}<br>
${escapeHtml(site.name)} · ${escapeHtml(site.city)}, ${escapeHtml(site.state)}
</td></tr>
</table>
</td></tr></table>
</body></html>`

  return { subject: subjectLine(content.subject), text, html }
}
