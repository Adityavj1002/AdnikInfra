import { z } from 'zod'

const origin = z
  .url({ protocol: /^https?$/ })
  .transform((value) => new URL(value).origin)

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
    // Where enquiries go. "log" (redacted, development only) until a CRM/email sink is wired.
    // Unset: "log" in development, "off" elsewhere — production never pretends to accept leads.
    LEADS_MODE: z.enum(['log', 'off']).optional(),
  })
  .transform((env) => ({
    ...env,
    LEADS_MODE: env.LEADS_MODE ?? (env.NODE_ENV === 'development' ? 'log' : 'off'),
  }))
  .superRefine((env, ctx) => {
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
