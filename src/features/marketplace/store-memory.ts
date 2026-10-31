import 'server-only'
import { randomUUID } from 'node:crypto'
import { LISTING_STATUSES } from './constants'
import type { MarketplaceStore, Page } from './store'
import type { Admin, AdminWithHash, Campaign, Listing, ListingEvent, Subscriber } from './types'

const page = <T>(items: readonly T[], limit: number, offset = 0): Page<T> => ({
  items: items.slice(offset, offset + limit),
  total: items.length,
})

/**
 * Process-memory store for development and the e2e suite. Data is lost on restart and is
 * not shared between server instances: never a production store (env.ts refuses it there).
 */
export function createMemoryStore(): MarketplaceStore {
  const listings = new Map<string, Listing>()
  // Secrets live beside the records, as the database keeps them in columns the app never returns.
  const listingTokens = new Map<string, { hash: string; expiresAt: string }>()
  const events: ListingEvent[] = []
  const admins = new Map<string, Admin>()
  const passwords = new Map<string, string>()
  const sessions = new Map<string, { adminId: string; expiresAt: Date }>()
  const subscribers = new Map<string, Subscriber>()
  const subscriberTokens = new Map<string, string>()
  const campaigns: Campaign[] = []
  let eventId = 0
  const now = () => new Date().toISOString()

  const adminName = (id: string | null) => (id ? (admins.get(id)?.name ?? null) : null)
  const newest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt)

  const store: MarketplaceStore = {
    async createListing(input) {
      const { confirmTokenHash, confirmExpiresAt, ...rest } = input
      const listing: Listing = {
        ...rest,
        id: randomUUID(),
        status: 'unconfirmed',
        state: 'Rajasthan',
        confirmedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        rejectReason: null,
        createdAt: now(),
        updatedAt: now(),
      }
      listings.set(listing.id, listing)
      listingTokens.set(listing.id, { hash: confirmTokenHash, expiresAt: confirmExpiresAt })
      await store.addEvent(listing.id, 'submitted')
      return listing
    },

    async confirmListing(tokenHash, at) {
      const entry = [...listingTokens].find(([, token]) => token.hash === tokenHash)
      const listing = entry && listings.get(entry[0])
      if (!entry || !listing) return undefined
      if (new Date(entry[1].expiresAt) < at) return 'expired'
      const updated: Listing = { ...listing, status: 'pending', confirmedAt: at.toISOString(), updatedAt: now() }
      listings.set(listing.id, updated)
      listingTokens.delete(listing.id)
      await store.addEvent(listing.id, 'confirmed')
      return updated
    },

    async getListing(id) {
      return listings.get(id)
    },

    async getListingBySlug(slug) {
      return [...listings.values()].find((l) => l.slug === slug)
    },

    async listListings({ status, filters = {}, limit, offset }) {
      const city = filters.city?.toLowerCase()
      const matches = [...listings.values()]
        .filter((l) => !status || l.status === status)
        .filter((l) => !filters.kind || l.kind === filters.kind)
        .filter((l) => !filters.purpose || l.purpose === filters.purpose)
        .filter((l) => !city || l.city.toLowerCase() === city)
        .filter((l) => !filters.maxPrice || l.priceInr <= filters.maxPrice)
        .sort((a, b) => (b.reviewedAt ?? b.createdAt).localeCompare(a.reviewedAt ?? a.createdAt))
      return page(matches, limit, offset)
    },

    async countListings() {
      const counts = Object.fromEntries(LISTING_STATUSES.map((s) => [s, 0])) as Record<(typeof LISTING_STATUSES)[number], number>
      for (const listing of listings.values()) counts[listing.status] += 1
      return counts
    },

    async reviewListing(id, adminId, decision, note) {
      const listing = listings.get(id)
      if (!listing) return undefined
      const updated: Listing = {
        ...listing,
        status: decision === 'approved' ? 'approved' : 'rejected',
        reviewedBy: adminId,
        reviewedAt: now(),
        rejectReason: decision === 'approved' ? null : (note ?? null),
        updatedAt: now(),
      }
      listings.set(id, updated)
      await store.addEvent(id, decision, adminId, note)
      return updated
    },

    async listEvents(listingId) {
      return events.filter((e) => e.listingId === listingId).map((e) => ({ ...e, adminName: adminName(e.adminId) }))
    },

    async addEvent(listingId, action, adminId, note) {
      eventId += 1
      events.push({ id: eventId, listingId, action, adminId: adminId ?? null, adminName: null, note: note ?? null, createdAt: now() })
    },

    async countAdmins() {
      return admins.size
    },

    async getAdmin(id) {
      return admins.get(id)
    },

    async getAdminByEmail(email): Promise<AdminWithHash | undefined> {
      const admin = [...admins.values()].find((a) => a.email === email)
      const passwordHash = admin && passwords.get(admin.id)
      return admin && passwordHash ? { ...admin, passwordHash } : undefined
    },

    async listAdmins() {
      return [...admins.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    },

    async createAdmin({ email, name, passwordHash }) {
      if ([...admins.values()].some((a) => a.email === email)) return 'exists'
      const admin: Admin = { id: randomUUID(), email, name, createdAt: now(), lastLoginAt: null }
      admins.set(admin.id, admin)
      passwords.set(admin.id, passwordHash)
      return admin
    },

    async setAdminPassword(id, passwordHash) {
      if (admins.has(id)) passwords.set(id, passwordHash)
    },

    async deleteAdmin(id) {
      admins.delete(id)
      passwords.delete(id)
      await store.deleteSessionsFor(id)
    },

    async recordLogin(id) {
      const admin = admins.get(id)
      if (admin) admins.set(id, { ...admin, lastLoginAt: now() })
    },

    async createSession(tokenHash, adminId, expiresAt) {
      sessions.set(tokenHash, { adminId, expiresAt })
    },

    async getSession(tokenHash) {
      return sessions.get(tokenHash)
    },

    async deleteSession(tokenHash) {
      sessions.delete(tokenHash)
    },

    async deleteSessionsFor(adminId) {
      for (const [hash, session] of sessions) if (session.adminId === adminId) sessions.delete(hash)
    },

    async subscribe(email, tokenHash, source) {
      const existing = subscribers.get(email)
      if (existing?.status === 'active') return 'already-active'
      subscribers.set(email, {
        id: existing?.id ?? randomUUID(),
        email,
        status: 'pending',
        source,
        createdAt: existing?.createdAt ?? now(),
        confirmedAt: null,
        unsubscribedAt: null,
      })
      subscriberTokens.set(email, tokenHash)
      return existing ? 'renewed' : 'created'
    },

    async confirmSubscriber(tokenHash) {
      const email = [...subscriberTokens].find(([, hash]) => hash === tokenHash)?.[0]
      const subscriber = email && subscribers.get(email)
      if (!email || !subscriber) return undefined
      const updated: Subscriber = { ...subscriber, status: 'active', confirmedAt: now() }
      subscribers.set(email, updated)
      subscriberTokens.delete(email)
      return updated
    },

    async unsubscribe(email) {
      const subscriber = subscribers.get(email)
      if (!subscriber || subscriber.status === 'unsubscribed') return false
      subscribers.set(email, { ...subscriber, status: 'unsubscribed', unsubscribedAt: now() })
      subscriberTokens.delete(email)
      return true
    },

    async listSubscribers({ status, limit, offset }) {
      const matches = [...subscribers.values()]
        .filter((s) => !status || s.status === status)
        .sort(newest)
      return page(matches, limit, offset)
    },

    async countSubscribers() {
      const counts = { pending: 0, active: 0, unsubscribed: 0 }
      for (const subscriber of subscribers.values()) counts[subscriber.status] += 1
      return counts
    },

    async activeSubscriberEmails() {
      return [...subscribers.values()].filter((s) => s.status === 'active').map((s) => s.email)
    },

    async createCampaign({ subject, body, includeListings, recipients, createdBy }) {
      const campaign: Campaign = {
        id: randomUUID(),
        subject,
        body,
        includeListings,
        status: 'sending',
        recipients,
        sentCount: 0,
        failedCount: 0,
        createdBy,
        createdAt: now(),
        finishedAt: null,
      }
      campaigns.push(campaign)
      return campaign
    },

    async finishCampaign(id, { sentCount, failedCount }) {
      const index = campaigns.findIndex((c) => c.id === id)
      const campaign = campaigns[index]
      if (!campaign) return
      campaigns[index] = {
        ...campaign,
        sentCount,
        failedCount,
        status: sentCount === 0 && failedCount > 0 ? 'failed' : 'sent',
        finishedAt: now(),
      }
    },

    async listCampaigns(limit) {
      return [...campaigns].sort(newest).slice(0, limit)
    },
  }
  return store
}
