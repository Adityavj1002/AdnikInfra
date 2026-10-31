import 'server-only'
import type { ListingStatus } from './constants'
import type {
  Admin,
  AdminWithHash,
  Campaign,
  Listing,
  ListingEvent,
  ListingEventAction,
  ListingFilters,
  NewListing,
  StatusCounts,
  Subscriber,
  SubscriberStatus,
} from './types'

export type Page<T> = Readonly<{ items: readonly T[]; total: number }>

export type ReviewDecision = 'approved' | 'rejected' | 'unpublished'

export type SubscribeOutcome = 'created' | 'renewed' | 'already-active'

/**
 * Everything the marketplace persists, behind one interface: Supabase in production, process
 * memory in development and the e2e suite. Callers never see which one is in use.
 */
export interface MarketplaceStore {
  createListing(input: NewListing): Promise<Listing>
  /** Moves an unconfirmed listing into the review queue. 'expired' when the link is too old. */
  confirmListing(tokenHash: string, now: Date): Promise<Listing | 'expired' | undefined>
  getListing(id: string): Promise<Listing | undefined>
  getListingBySlug(slug: string): Promise<Listing | undefined>
  listListings(query: Readonly<{ status?: ListingStatus; filters?: ListingFilters; limit: number; offset?: number }>): Promise<Page<Listing>>
  countListings(): Promise<StatusCounts>
  reviewListing(id: string, adminId: string, decision: ReviewDecision, note?: string): Promise<Listing | undefined>
  listEvents(listingId: string): Promise<readonly ListingEvent[]>
  addEvent(listingId: string, action: ListingEventAction, adminId?: string, note?: string): Promise<void>

  countAdmins(): Promise<number>
  getAdmin(id: string): Promise<Admin | undefined>
  getAdminByEmail(email: string): Promise<AdminWithHash | undefined>
  listAdmins(): Promise<readonly Admin[]>
  createAdmin(input: Readonly<{ email: string; name: string; passwordHash: string; createdBy?: string }>): Promise<Admin | 'exists'>
  setAdminPassword(id: string, passwordHash: string): Promise<void>
  deleteAdmin(id: string): Promise<void>
  recordLogin(id: string): Promise<void>

  createSession(tokenHash: string, adminId: string, expiresAt: Date): Promise<void>
  getSession(tokenHash: string): Promise<Readonly<{ adminId: string; expiresAt: Date }> | undefined>
  deleteSession(tokenHash: string): Promise<void>
  deleteSessionsFor(adminId: string): Promise<void>

  subscribe(email: string, tokenHash: string, source: string): Promise<SubscribeOutcome>
  confirmSubscriber(tokenHash: string): Promise<Subscriber | undefined>
  unsubscribe(email: string): Promise<boolean>
  listSubscribers(query: Readonly<{ status?: SubscriberStatus; limit: number; offset?: number }>): Promise<Page<Subscriber>>
  countSubscribers(): Promise<Readonly<Record<SubscriberStatus, number>>>
  activeSubscriberEmails(): Promise<readonly string[]>

  createCampaign(input: Readonly<{ subject: string; body: string; includeListings: boolean; recipients: number; createdBy: string }>): Promise<Campaign>
  finishCampaign(id: string, result: Readonly<{ sentCount: number; failedCount: number }>): Promise<void>
  listCampaigns(limit: number): Promise<readonly Campaign[]>
}
