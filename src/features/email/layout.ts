import 'server-only'
import { site } from '@/config/site'

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
const GOLD = '#c49a45'
const GOLD_INK = '#7a5718'
const CREAM = '#f7f5ef'
const BORDER = '#e6e0d1'
const MUTED = '#5a6275'
const FONT = "Arial,'Helvetica Neue',Helvetica,sans-serif"

export type EmailBlock =
  | Readonly<{ type: 'p'; text: string }>
  | Readonly<{ type: 'rows'; rows: readonly (readonly [string, string | undefined | null])[] }>
  | Readonly<{ type: 'quote'; label: string; text: string }>
  | Readonly<{ type: 'button'; label: string; url: string }>
  | Readonly<{ type: 'list'; items: readonly string[] }>
  | Readonly<{ type: 'cards'; cards: readonly Readonly<{ title: string; meta: string; url: string; image?: string }>[] }>
  | Readonly<{ type: 'note'; text: string }>

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

function blockHtml(block: EmailBlock): string {
  switch (block.type) {
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

function blockText(block: EmailBlock): string {
  switch (block.type) {
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

  const text = [content.title, '', ...content.blocks.map(blockText).flatMap((t) => [t, '']), '--', footer].join('\n')

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(content.subject)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${FONT};color:${NAVY};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;">
<tr><td style="background:${NAVY};padding:20px 28px;">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;letter-spacing:1px;color:#ffffff;">${escapeHtml(site.name.split(' ')[0] ?? site.name).toUpperCase()} <span style="color:${GOLD};">${escapeHtml(site.name.split(' ').slice(1).join(' ')).toUpperCase()}</span></span><br>
<span style="font-size:10px;letter-spacing:3px;color:#aeb8d2;">${escapeHtml(site.tagline.toUpperCase())}</span>
</td></tr>
<tr><td style="height:3px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="background:#ffffff;padding:28px;border:1px solid ${BORDER};border-top:0;">
${content.eyebrow ? `<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${GOLD_INK};">${escapeHtml(content.eyebrow)}</p>` : ''}
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${NAVY};">${escapeHtml(content.title)}</h1>
${content.blocks.map(blockHtml).join('\n')}
</td></tr>
<tr><td style="padding:18px 28px;font-size:12px;line-height:1.6;color:${MUTED};">
${escapeHtml(content.reason)}${content.unsubscribeUrl ? `<br><a href="${escapeHtml(safeUrl(content.unsubscribeUrl))}" style="color:${GOLD_INK};">Unsubscribe</a>` : ''}<br>
${escapeHtml(site.name)} · ${escapeHtml(site.city)}, ${escapeHtml(site.state)}${site.contact.email ? ` · <a href="mailto:${escapeHtml(site.contact.email)}" style="color:${GOLD_INK};">${escapeHtml(site.contact.email)}</a>` : ''}
</td></tr>
</table>
</td></tr></table>
</body></html>`

  return { subject: subjectLine(content.subject), text, html }
}
