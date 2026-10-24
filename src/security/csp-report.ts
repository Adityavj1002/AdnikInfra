import { z } from 'zod'

export const MAX_REPORT_BYTES = 16 * 1024
const MAX_FIELD_LENGTH = 300
const MAX_REPORTS_PER_BATCH = 20

export type CspViolation = Readonly<{
  documentUrl: string
  directive: string
  blocked: string
  disposition: string
}>

const field = z.string().optional()

// report-uri format: { "csp-report": { ... } } with kebab-case keys.
const legacySchema = z.object({
  'csp-report': z.object({
    'document-uri': field,
    'effective-directive': field,
    'violated-directive': field,
    'blocked-uri': field,
    disposition: field,
  }),
})

// Reporting API format: an array of reports with camelCase bodies.
const reportingApiSchema = z
  .array(
    z.object({
      type: z.string(),
      body: z.object({
        documentURL: field,
        effectiveDirective: field,
        blockedURL: field,
        disposition: field,
      }),
    }),
  )
  .max(MAX_REPORTS_PER_BATCH)

/** Attacker-controlled text: strip control characters and cap length before it reaches logs. */
export function cleanField(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, '').slice(0, MAX_FIELD_LENGTH)
}

export function normalizeCspReports(payload: unknown): readonly CspViolation[] {
  const legacy = legacySchema.safeParse(payload)
  if (legacy.success) {
    const report = legacy.data['csp-report']
    return [
      {
        documentUrl: cleanField(report['document-uri']),
        directive: cleanField(report['effective-directive'] ?? report['violated-directive']),
        blocked: cleanField(report['blocked-uri']),
        disposition: cleanField(report.disposition),
      },
    ]
  }

  const batch = reportingApiSchema.safeParse(payload)
  if (batch.success) {
    return batch.data
      .filter((report) => report.type === 'csp-violation')
      .map(({ body }) => ({
        documentUrl: cleanField(body.documentURL),
        directive: cleanField(body.effectiveDirective),
        blocked: cleanField(body.blockedURL),
        disposition: cleanField(body.disposition),
      }))
  }

  return []
}
