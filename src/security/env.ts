import { z } from 'zod'

const origin = z
  .url({ protocol: /^https?$/ })
  .transform((value) => new URL(value).origin)

const blankToUndefined = (value: unknown) => (value === '' ? undefined : value)

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true')

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SITE_URL: origin.default('http://localhost:3000'),
    MEDIA_ORIGIN: z.preprocess((value) => (value === '' ? undefined : value), origin.optional()),
    CSP_MODE: z.enum(['report-only', 'enforce']).default('report-only'),
    SITE_INDEXABLE: booleanString,
    // RFC 9116 contact for /.well-known/security.txt: mailto: or https URL. Unset = no file.
    SECURITY_CONTACT: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .string()
        .regex(/^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|https:\/\/\S+)$/, 'must be mailto: or https://')
        .optional(),
    ),
    // Where enquiries go: "email" (SMTP below), "log" (redacted, for development) or "off".
    // Unset: "email" when SMTP is configured, else "log" in development and "off" elsewhere,
    // so production never pretends to accept a lead it cannot deliver.
    LEADS_MODE: z.preprocess(blankToUndefined, z.enum(['email', 'log', 'off']).optional()),
    // SMTP for lead emails. Secrets live only in .env.local or the host's secret store.
    SMTP_HOST: z.preprocess(blankToUndefined, z.hostname().optional()),
    SMTP_PORT: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(65_535).default(465)),
    SMTP_USER: z.preprocess(blankToUndefined, z.string().max(320).optional()),
    SMTP_PASS: z.preprocess(blankToUndefined, z.string().max(512).optional()),
    LEADS_TO: z.preprocess(blankToUndefined, z.email().default('support@adnikinfra.com')),
    // Sender address. Gmail / Google Workspace only send as the signed-in account or its aliases.
    LEADS_FROM: z.preprocess(blankToUndefined, z.email().optional()),
  })
  .transform((env) => {
    const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
    return {
      ...env,
      LEADS_MODE: env.LEADS_MODE ?? (smtpConfigured ? 'email' : env.NODE_ENV === 'development' ? 'log' : 'off'),
    }
  })
  .superRefine((env, ctx) => {
    if (env.LEADS_MODE === 'email') {
      for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const) {
        if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: `Required when LEADS_MODE is email.` })
      }
      if (!env.LEADS_FROM && env.SMTP_USER && !z.email().safeParse(env.SMTP_USER).success) {
        ctx.addIssue({ code: 'custom', path: ['LEADS_FROM'], message: 'Set a sender address: SMTP_USER is not an email.' })
      }
    }
    if (env.SITE_INDEXABLE && !env.SITE_URL.startsWith('https://')) {
      ctx.addIssue({
        code: 'custom',
        path: ['SITE_URL'],
        message: 'An indexable site must have an https SITE_URL.',
      })
    }
  })

export type Env = Readonly<z.infer<typeof envSchema>>

/** Validates environment variables once; throws with every problem listed. */
export function parseEnv(source: Readonly<Record<string, string | undefined>>): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`)
  }
  return Object.freeze(result.data)
}

export const env: Env = parseEnv(process.env)
