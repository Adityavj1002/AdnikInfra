import 'server-only'
import { randomBytes } from 'node:crypto'
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
  const ready = password
    ? hashPassword(password).then(async (passwordHash) => {
        await store.createAdmin({ email: env.MARKETPLACE_DEV_ADMIN_EMAIL, name: 'Development admin', passwordHash })
      })
    : Promise.resolve()
  // Memory mode may run without a configured secret; links then last as long as the process.
  return { store, ready, secret: env.SIGNING_SECRET ?? randomBytes(32).toString('base64url') }
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
