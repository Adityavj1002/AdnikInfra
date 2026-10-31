import 'server-only'
import { createClient, type PostgrestError } from '@supabase/supabase-js'
import { LISTING_STATUSES, type ListingPhoto, type ListingStatus } from './constants'
import type { MarketplaceStore } from './store'
import type { Admin, AdminWithHash, Campaign, Listing, ListingEvent, StatusCounts, Subscriber, SubscriberStatus } from './types'

type Row = Record<string, unknown>

const LISTING_COLUMNS =
  'id, reference, slug, status, kind, purpose, title, description, price_inr, area_value, area_unit, bedrooms, city, locality, state, images, seller_name, seller_phone, seller_email, seller_role, confirmed_at, reviewed_by, reviewed_at, reject_reason, created_at, updated_at'
const ADMIN_COLUMNS = 'id, email, name, created_at, last_login_at'
const SUBSCRIBER_COLUMNS = 'id, email, status, source, created_at, confirmed_at, unsubscribed_at'
const CAMPAIGN_COLUMNS =
  'id, subject, body, include_listings, status, recipients, sent_count, failed_count, created_by, created_at, finished_at'

const str = (value: unknown) => String(value ?? '')
const strOrNull = (value: unknown) => (value === null || value === undefined ? null : String(value))

function toListing(row: Row): Listing {
  return {
    id: str(row.id),
    reference: str(row.reference),
    slug: str(row.slug),
    status: str(row.status) as Listing['status'],
    kind: str(row.kind) as Listing['kind'],
    purpose: str(row.purpose) as Listing['purpose'],
    title: str(row.title),
    description: str(row.description),
    priceInr: Number(row.price_inr),
    areaValue: Number(row.area_value),
    areaUnit: str(row.area_unit) as Listing['areaUnit'],
    bedrooms: row.bedrooms === null || row.bedrooms === undefined ? null : Number(row.bedrooms),
    city: str(row.city),
    locality: str(row.locality),
    state: str(row.state),
    images: Array.isArray(row.images) ? (row.images as ListingPhoto[]) : [],
    sellerName: str(row.seller_name),
    sellerPhone: str(row.seller_phone),
    sellerEmail: str(row.seller_email),
    sellerRole: str(row.seller_role) as Listing['sellerRole'],
    confirmedAt: strOrNull(row.confirmed_at),
    reviewedBy: strOrNull(row.reviewed_by),
    reviewedAt: strOrNull(row.reviewed_at),
    rejectReason: strOrNull(row.reject_reason),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  }
}

function toAdmin(row: Row): Admin {
  return {
    id: str(row.id),
    email: str(row.email),
    name: str(row.name),
    createdAt: str(row.created_at),
    lastLoginAt: strOrNull(row.last_login_at),
  }
}

function toSubscriber(row: Row): Subscriber {
  return {
    id: str(row.id),
    email: str(row.email),
    status: str(row.status) as SubscriberStatus,
    source: str(row.source),
    createdAt: str(row.created_at),
    confirmedAt: strOrNull(row.confirmed_at),
    unsubscribedAt: strOrNull(row.unsubscribed_at),
  }
}

function toCampaign(row: Row): Campaign {
  return {
    id: str(row.id),
    subject: str(row.subject),
    body: str(row.body),
    includeListings: Boolean(row.include_listings),
    status: str(row.status) as Campaign['status'],
    recipients: Number(row.recipients),
    sentCount: Number(row.sent_count),
    failedCount: Number(row.failed_count),
    createdBy: strOrNull(row.created_by),
    createdAt: str(row.created_at),
    finishedAt: strOrNull(row.finished_at),
  }
}

/** Throws with the Postgres code only: messages can echo row data, which never reaches logs. */
function check<T>(result: { data: T; error: PostgrestError | null }): T {
  if (result.error) throw new Error(`[marketplace] database error ${result.error.code}`)
  return result.data
}

/** `.single()` responses: a row, or check() has already thrown. */
const row = (value: Row | null): Row => {
  if (!value) throw new Error('[marketplace] database returned no row')
  return value
}

const UNIQUE_VIOLATION = '23505'

export function createSupabaseStore(url: string, serviceRoleKey: string): MarketplaceStore {
  const db = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-client-info': 'adnik-infra-website' } },
  })

  const store: MarketplaceStore = {
    async createListing(input) {
      const inserted = check(
        await db
          .from('listings')
          .insert({
            reference: input.reference,
            slug: input.slug,
            kind: input.kind,
            purpose: input.purpose,
            title: input.title,
            description: input.description,
            price_inr: input.priceInr,
            area_value: input.areaValue,
            area_unit: input.areaUnit,
            bedrooms: input.bedrooms,
            city: input.city,
            locality: input.locality,
            images: input.images,
            seller_name: input.sellerName,
            seller_phone: input.sellerPhone,
            seller_email: input.sellerEmail,
            seller_role: input.sellerRole,
            confirm_token_hash: input.confirmTokenHash,
            confirm_expires_at: input.confirmExpiresAt,
          })
          .select(LISTING_COLUMNS)
          .single(),
      )
      const listing = toListing(row(inserted))
      await store.addEvent(listing.id, 'submitted')
      return listing
    },

    async confirmListing(tokenHash, at) {
      const found = check(
        await db
          .from('listings')
          .select('id, confirm_expires_at')
          .eq('confirm_token_hash', tokenHash)
          .eq('status', 'unconfirmed')
          .maybeSingle(),
      )
      if (!found) return undefined
      if (found.confirm_expires_at && new Date(String(found.confirm_expires_at)) < at) return 'expired'
      const row = check(
        await db
          .from('listings')
          .update({ status: 'pending', confirmed_at: at.toISOString(), confirm_token_hash: null, confirm_expires_at: null })
          .eq('id', found.id)
          .eq('status', 'unconfirmed')
          .select(LISTING_COLUMNS)
          .maybeSingle(),
      )
      if (!row) return undefined
      const listing = toListing(row)
      await store.addEvent(listing.id, 'confirmed')
      return listing
    },

    async getListing(id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined
      const row = check(await db.from('listings').select(LISTING_COLUMNS).eq('id', id).maybeSingle())
      return row ? toListing(row) : undefined
    },

    async getListingBySlug(slug) {
      const row = check(await db.from('listings').select(LISTING_COLUMNS).eq('slug', slug).maybeSingle())
      return row ? toListing(row) : undefined
    },

    async listListings({ status, filters = {}, limit, offset = 0 }) {
      let query = db.from('listings').select(LISTING_COLUMNS, { count: 'exact' })
      if (status) query = query.eq('status', status)
      if (filters.kind) query = query.eq('kind', filters.kind)
      if (filters.purpose) query = query.eq('purpose', filters.purpose)
      if (filters.city) query = query.ilike('city', filters.city.replace(/[%_\\]/g, ''))
      if (filters.maxPrice) query = query.lte('price_inr', filters.maxPrice)
      const result = await query
        .order(status === 'approved' ? 'reviewed_at' : 'created_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1)
      const rows = check(result)
      return { items: (rows ?? []).map(toListing), total: result.count ?? 0 }
    },

    async countListings() {
      const counts = await Promise.all(
        LISTING_STATUSES.map(async (status) => {
          const result = await db.from('listings').select('id', { count: 'exact', head: true }).eq('status', status)
          check(result)
          return [status, result.count ?? 0] as const
        }),
      )
      return Object.fromEntries(counts) as StatusCounts
    },

    async reviewListing(id, adminId, decision, note) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined
      const row = check(
        await db
          .from('listings')
          .update({
            status: decision === 'approved' ? 'approved' : 'rejected',
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
            reject_reason: decision === 'approved' ? null : (note ?? null),
          })
          .eq('id', id)
          .in('status', decision === 'unpublished' ? ['approved'] : (['pending', 'approved', 'rejected'] as ListingStatus[]))
          .select(LISTING_COLUMNS)
          .maybeSingle(),
      )
      if (!row) return undefined
      await store.addEvent(id, decision, adminId, note)
      return toListing(row)
    },

    async listEvents(listingId) {
      const rows = check(
        await db
          .from('listing_events')
          .select('id, listing_id, action, admin_id, note, created_at, admins(name)')
          .eq('listing_id', listingId)
          .order('created_at', { ascending: true }),
      )
      return (rows ?? []).map(
        (row: Row): ListingEvent => ({
          id: Number(row.id),
          listingId: str(row.listing_id),
          action: str(row.action) as ListingEvent['action'],
          adminId: strOrNull(row.admin_id),
          adminName: strOrNull((row.admins as Row | null)?.name),
          note: strOrNull(row.note),
          createdAt: str(row.created_at),
        }),
      )
    },

    async addEvent(listingId, action, adminId, note) {
      check(await db.from('listing_events').insert({ listing_id: listingId, action, admin_id: adminId ?? null, note: note ?? null }))
    },

    async countAdmins() {
      const result = await db.from('admins').select('id', { count: 'exact', head: true })
      check(result)
      return result.count ?? 0
    },

    async getAdmin(id) {
      const row = check(await db.from('admins').select(ADMIN_COLUMNS).eq('id', id).maybeSingle())
      return row ? toAdmin(row) : undefined
    },

    async getAdminByEmail(email): Promise<AdminWithHash | undefined> {
      const row = check(await db.from('admins').select(`${ADMIN_COLUMNS}, password_hash`).eq('email', email).maybeSingle())
      return row ? { ...toAdmin(row), passwordHash: str(row.password_hash) } : undefined
    },

    async listAdmins() {
      const rows = check(await db.from('admins').select(ADMIN_COLUMNS).order('created_at', { ascending: true }))
      return (rows ?? []).map(toAdmin)
    },

    async createAdmin({ email, name, passwordHash, createdBy }) {
      const result = await db
        .from('admins')
        .insert({ email, name, password_hash: passwordHash, created_by: createdBy ?? null })
        .select(ADMIN_COLUMNS)
        .single()
      if (result.error?.code === UNIQUE_VIOLATION) return 'exists'
      return toAdmin(row(check(result)))
    },

    async setAdminPassword(id, passwordHash) {
      check(await db.from('admins').update({ password_hash: passwordHash }).eq('id', id))
    },

    async deleteAdmin(id) {
      check(await db.from('admins').delete().eq('id', id))
    },

    async recordLogin(id) {
      check(await db.from('admins').update({ last_login_at: new Date().toISOString() }).eq('id', id))
    },

    async createSession(tokenHash, adminId, expiresAt) {
      check(await db.from('admin_sessions').insert({ token_hash: tokenHash, admin_id: adminId, expires_at: expiresAt.toISOString() }))
      // Housekeeping: expired sessions are useless; clear them as new ones arrive.
      check(await db.from('admin_sessions').delete().lt('expires_at', new Date().toISOString()))
    },

    async getSession(tokenHash) {
      const row = check(await db.from('admin_sessions').select('admin_id, expires_at').eq('token_hash', tokenHash).maybeSingle())
      return row ? { adminId: str(row.admin_id), expiresAt: new Date(str(row.expires_at)) } : undefined
    },

    async deleteSession(tokenHash) {
      check(await db.from('admin_sessions').delete().eq('token_hash', tokenHash))
    },

    async deleteSessionsFor(adminId) {
      check(await db.from('admin_sessions').delete().eq('admin_id', adminId))
    },

    async subscribe(email, tokenHash, source) {
      const existing = check(await db.from('subscribers').select('status').eq('email', email).maybeSingle())
      if (existing?.status === 'active') return 'already-active'
      check(
        await db
          .from('subscribers')
          .upsert(
            { email, status: 'pending', confirm_token_hash: tokenHash, source, confirmed_at: null, unsubscribed_at: null },
            { onConflict: 'email' },
          ),
      )
      return existing ? 'renewed' : 'created'
    },

    async confirmSubscriber(tokenHash) {
      const row = check(
        await db
          .from('subscribers')
          .update({ status: 'active', confirmed_at: new Date().toISOString(), confirm_token_hash: null })
          .eq('confirm_token_hash', tokenHash)
          .eq('status', 'pending')
          .select(SUBSCRIBER_COLUMNS)
          .maybeSingle(),
      )
      return row ? toSubscriber(row) : undefined
    },

    async unsubscribe(email) {
      const rows = check(
        await db
          .from('subscribers')
          .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), confirm_token_hash: null })
          .eq('email', email)
          .neq('status', 'unsubscribed')
          .select('id'),
      )
      return (rows ?? []).length > 0
    },

    async listSubscribers({ status, limit, offset = 0 }) {
      let query = db.from('subscribers').select(SUBSCRIBER_COLUMNS, { count: 'exact' })
      if (status) query = query.eq('status', status)
      const result = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
      const rows = check(result)
      return { items: (rows ?? []).map(toSubscriber), total: result.count ?? 0 }
    },

    async countSubscribers() {
      const statuses: readonly SubscriberStatus[] = ['pending', 'active', 'unsubscribed']
      const counts = await Promise.all(
        statuses.map(async (status) => {
          const result = await db.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', status)
          check(result)
          return [status, result.count ?? 0] as const
        }),
      )
      return Object.fromEntries(counts) as Record<SubscriberStatus, number>
    },

    async activeSubscriberEmails() {
      const emails: string[] = []
      // Page through: PostgREST caps a single response at 1,000 rows.
      for (let from = 0; ; from += 1000) {
        const rows = check(
          await db
            .from('subscribers')
            .select('email')
            .eq('status', 'active')
            .order('created_at', { ascending: true })
            .range(from, from + 999),
        )
        emails.push(...(rows ?? []).map((row: Row) => str(row.email)))
        if (!rows || rows.length < 1000) return emails
      }
    },

    async createCampaign({ subject, body, includeListings, recipients, createdBy }) {
      const inserted = check(
        await db
          .from('campaigns')
          .insert({ subject, body, include_listings: includeListings, recipients, created_by: createdBy })
          .select(CAMPAIGN_COLUMNS)
          .single(),
      )
      return toCampaign(row(inserted))
    },

    async finishCampaign(id, { sentCount, failedCount }) {
      check(
        await db
          .from('campaigns')
          .update({
            sent_count: sentCount,
            failed_count: failedCount,
            status: sentCount === 0 && failedCount > 0 ? 'failed' : 'sent',
            finished_at: new Date().toISOString(),
          })
          .eq('id', id),
      )
    },

    async listCampaigns(limit) {
      const rows = check(await db.from('campaigns').select(CAMPAIGN_COLUMNS).order('created_at', { ascending: false }).limit(limit))
      return (rows ?? []).map(toCampaign)
    },
  }
  return store
}
