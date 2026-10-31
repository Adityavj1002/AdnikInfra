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

    // Marketplace store: "supabase" (production), "memory" (development and the e2e suite: data
    // lives in the server process and is lost on restart) or "off". Unset: "supabase" when it is
    // configured, else "memory" in development and "off" elsewhere.
    MARKETPLACE_MODE: z.preprocess(blankToUndefined, z.enum(['supabase', 'memory', 'off']).optional()),
    SUPABASE_URL: z.preprocess(blankToUndefined, z.url({ protocol: /^https?$/ }).optional()),
    // Server-only. Bypasses row-level security, so it must never reach the browser.
    SUPABASE_SERVICE_ROLE_KEY: z.preprocess(blankToUndefined, z.string().min(20).max(2000).optional()),
    // Photos: signed uploads straight from the seller's browser to Cloudinary.
    CLOUDINARY_CLOUD_NAME: z.preprocess(blankToUndefined, z.string().regex(/^[a-z0-9_-]{1,64}$/i).optional()),
    CLOUDINARY_API_KEY: z.preprocess(blankToUndefined, z.string().regex(/^\d{6,20}$/).optional()),
    CLOUDINARY_API_SECRET: z.preprocess(blankToUndefined, z.string().min(10).max(200).optional()),
    // Signs unsubscribe links. 32+ random characters; changing it invalidates links already sent.
    SIGNING_SECRET: z.preprocess(blankToUndefined, z.string().min(32).max(512).optional()),
    // Memory mode only: the admin account seeded at start-up.
    MARKETPLACE_DEV_ADMIN_EMAIL: z.preprocess(blankToUndefined, z.email().default('admin@example.com')),
    MARKETPLACE_DEV_ADMIN_PASSWORD: z.preprocess(blankToUndefined, z.string().min(12).max(200).optional()),
  })
  .transform((env) => {
    const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
    const supabaseConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
    return {
      ...env,
      LEADS_MODE: env.LEADS_MODE ?? (smtpConfigured ? 'email' : env.NODE_ENV === 'development' ? 'log' : 'off'),
      MARKETPLACE_MODE:
        env.MARKETPLACE_MODE ?? (supabaseConfigured ? 'supabase' : env.NODE_ENV === 'development' ? 'memory' : 'off'),
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
    if (env.MARKETPLACE_MODE === 'supabase') {
      for (const key of [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'SIGNING_SECRET',
      ] as const) {
        if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'Required when MARKETPLACE_MODE is supabase.' })
      }
    }
    if (env.MARKETPLACE_MODE === 'memory' && env.SITE_INDEXABLE) {
      ctx.addIssue({ code: 'custom', path: ['MARKETPLACE_MODE'], message: 'memory is for development and tests, not a live site.' })
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
