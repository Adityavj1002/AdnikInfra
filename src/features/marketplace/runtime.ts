import 'server-only'
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { hashPassword } from '@/security/password'
import { env } from '@/security/env'
import type { MarketplaceStore } from './store'
import { createMemoryStore } from './store-memory'
import { createSupabaseStore } from './store-supabase'

export const marketplaceEnabled = env.MARKETPLACE_MODE !== 'off'

type Runtime = { store: MarketplaceStore; ready: Promise<void>; secret: string }

// One store per server process. Kept on globalThis so development hot reloads, which
// re-evaluate this module, don't wipe the memory store.
const holder = globalThis as typeof globalThis & { __adnikMarketplace?: Runtime }

function createRuntime(): Runtime {
  if (env.MARKETPLACE_MODE === 'supabase' && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      store: createSupabaseStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY),
      ready: Promise.resolve(),
      secret: env.SIGNING_SECRET ?? '',
    }
  }
  const store = createMemoryStore()
  const password = env.MARKETPLACE_DEV_ADMIN_PASSWORD
  const admin = password
    ? hashPassword(password).then(async (passwordHash) => {
        await store.createAdmin({ email: env.MARKETPLACE_DEV_ADMIN_EMAIL, name: 'Development admin', passwordHash })
      })
    : Promise.resolve()
  const ready = Promise.all([admin, seedProjects(store)]).then(() => undefined)
  // Memory mode may run without a configured secret; links then last as long as the process.
  return { store, ready, secret: env.SIGNING_SECRET ?? randomBytes(32).toString('base64url') }
}

/**
 * Memory mode starts with the same projects a fresh database is seeded with
 * (supabase/seed/projects.json, scripts/seed-projects.mjs), so development and the e2e suite
 * have content to show. Data, not code: the live site reads its projects from Supabase only.
 */
async function seedProjects(store: MarketplaceStore): Promise<void> {
  try {
    const seed = JSON.parse(await readFile(join(process.cwd(), 'supabase', 'seed', 'projects.json'), 'utf8')) as unknown
    if (!Array.isArray(seed)) return
    for (const item of seed as { slug?: unknown; record?: unknown }[]) {
      if (typeof item.slug === 'string') await store.saveProjectRecord(item.slug, item.record, 'seed')
    }
  } catch (error) {
    console.error(`[marketplace] no project seed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
  }
}

function runtime(): Runtime {
  holder.__adnikMarketplace ??= createRuntime()
  return holder.__adnikMarketplace
}

/** The store, once start-up seeding is done. Throws if the marketplace is switched off. */
export async function getStore(): Promise<MarketplaceStore> {
  if (!marketplaceEnabled) throw new Error('[marketplace] MARKETPLACE_MODE is off')
  const { store, ready } = runtime()
  await ready
  return store
}

export function signingSecret(): string {
  return runtime().secret
}
