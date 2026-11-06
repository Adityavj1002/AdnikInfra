import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { composeLeadEmail, composeLeadReceipt, escapeHtml, headerSafe } from '@/features/enquiry/lead-email'
import type { Lead } from '@/features/enquiry/lead-sink'

const lead: Lead = {
  kind: 'site-visit',
  topic: 'site-visit',
  ref: 'Vijay Aura Villas',
  name: 'Asha Mehta',
  phone: '+919829012345',
  email: 'asha@example.com',
  preference: 'whatsapp',
  message: 'Saturday works.\nPlease share the brochure.',
  visitDate: '2026-11-07',
  visitSlot: 'morning',
}

describe('composeLeadEmail', () => {
  const at = new Date('2026-10-24T06:30:00Z')

  it('puts the reference, name and project in the subject', () => {
    expect(composeLeadEmail(lead, 'ADN-7F3K2Q', at).subject).toBe('Site visit request: Asha Mehta, Vijay Aura Villas [ADN-7F3K2Q]')
  })

  it('lists every filled field with human labels in the text body', () => {
    const { text } = composeLeadEmail(lead, 'ADN-7F3K2Q', at)
    expect(text).toContain('Topic: Booking a site visit')
    expect(text).toContain('Contact by: WhatsApp')
    expect(text).toContain('Visit: 2026-11-07, Morning (10 am – 1 pm)')
    expect(text).toContain('Submitted: 24 Oct 2026, 12:00 pm IST')
    expect(text).toContain('Saturday works.\nPlease share the brochure.')
  })

  it('leaves out fields the visitor did not fill', () => {
    const { text } = composeLeadEmail({ kind: 'enquiry', topic: 'buy', name: 'Ravi', phone: '9829012345' }, 'ADN-AAAAAA', at)
    expect(text).not.toMatch(/^(About|Email|Visit):/m)
    expect(text).toContain('No email given')
  })

  it('escapes visitor input in the HTML body', () => {
    const { html } = composeLeadEmail({ ...lead, name: '<img src=x onerror=alert(1)>', message: '"><script>x</script>' }, 'ADN-1', at)
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('cannot be used to inject mail headers through the subject', () => {
    const { subject } = composeLeadEmail({ ...lead, name: 'Asha\r\nBcc: victim@example.com' }, 'ADN-1', at)
    expect(subject).not.toMatch(/[\r\n]/)
  })
})

describe('header and HTML helpers', () => {
  it('flattens every kind of line break', () => {
    expect(headerSafe(`a\r\nb\nc\u2028d\u2029e`)).toBe('a b c d e')
  })

  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
  })
})

describe('composeLeadReceipt', () => {
  const at = new Date('2026-10-24T06:30:00Z')

  it('gives the customer their reference, the visit and what happens next', () => {
    const { subject, text } = composeLeadReceipt(lead, 'ADN-7F3K2Q', at)
    expect(subject).toBe('Your site visit request is in [ADN-7F3K2Q]')
    expect(text).toContain('Your reference: ADN-7F3K2Q')
    expect(text).toContain('Preferred visit: Saturday, 7 November 2026, Morning (10 am – 1 pm)')
    expect(text).toContain('[done] Request received: 24 Oct 2026, 12:00 pm IST')
    expect(text).toContain('[now]  We confirm your visit')
    expect(text).toContain('Saturday works.\nPlease share the brochure.')
    expect(text).toContain('Call us: +91 77372 09850')
  })

  it('addresses an enquiry by first name and keeps visitor text inert', () => {
    const { subject, html } = composeLeadReceipt({ kind: 'enquiry', topic: 'buy', name: 'Ravi <b>Kumar</b>', phone: '9829012345', email: 'r@example.com' }, 'ADN-AAAAAA', at)
    expect(subject).toBe('We have your enquiry, Ravi [ADN-AAAAAA]')
    expect(html).not.toContain('<b>Kumar')
  })
})

describe('deliverLead over SMTP', () => {
  const sendMail = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    sendMail.mockReset()
    vi.doMock('nodemailer', () => ({ default: { createTransport: vi.fn(() => ({ sendMail })) } }))
    vi.stubEnv('SMTP_HOST', 'smtp.gmail.com')
    vi.stubEnv('SMTP_USER', 'support@adnikinfra.com')
    vi.stubEnv('SMTP_PASS', 'test-app-password')
    vi.stubEnv('LEADS_MODE', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('nodemailer')
  })

  it('emails the lead to support with the visitor as Reply-To, then a receipt to the visitor', async () => {
    sendMail.mockResolvedValue({ messageId: '<1@test>' })
    const { deliverLead } = await import('@/features/enquiry/lead-sink')

    await expect(deliverLead(lead, 'ADN-7F3K2Q')).resolves.toBe(true)
    expect(sendMail).toHaveBeenCalledTimes(2)
    const [team, receipt] = sendMail.mock.calls.map((call) => call[0])
    expect(team.to).toEqual([{ name: 'Adnik Infra team', address: 'support@adnikinfra.com' }])
    expect(team.from).toEqual({ name: 'Adnik Infra', address: 'support@adnikinfra.com' })
    expect(team.replyTo).toEqual({ name: 'Asha Mehta', address: 'asha@example.com' })
    expect(receipt.to).toEqual([{ name: 'Asha Mehta', address: 'asha@example.com' }])
    expect(receipt.replyTo).toEqual({ name: 'Adnik Infra team', address: 'support@adnikinfra.com' })
  })

  it('sends no receipt without an email, and a failed receipt does not fail the lead', async () => {
    const { deliverLead } = await import('@/features/enquiry/lead-sink')
    sendMail.mockResolvedValue({ messageId: '<1@test>' })
    await expect(deliverLead({ ...lead, email: undefined }, 'ADN-1')).resolves.toBe(true)
    expect(sendMail).toHaveBeenCalledOnce()

    sendMail.mockReset()
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMail.mockResolvedValueOnce({ messageId: '<2@test>' }).mockRejectedValueOnce(Object.assign(new Error('bounce'), { code: 'EENVELOPE' }))
    await expect(deliverLead(lead, 'ADN-2')).resolves.toBe(true)
    log.mockRestore()
  })

  it('reports failure, and logs no personal data, when the server rejects the message', async () => {
    sendMail.mockRejectedValue(Object.assign(new Error('550 asha@example.com rejected'), { code: 'EENVELOPE', responseCode: 550 }))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { deliverLead } = await import('@/features/enquiry/lead-sink')

    await expect(deliverLead(lead, 'ADN-7F3K2Q')).resolves.toBe(false)
    const logged = log.mock.calls.flat().join(' ')
    expect(logged).toContain('EENVELOPE')
    expect(logged).not.toContain('asha')
    expect(logged).not.toContain('9829012345')
    log.mockRestore()
  })
})
