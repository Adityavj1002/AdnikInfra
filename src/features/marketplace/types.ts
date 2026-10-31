import type { AreaUnit, ListingKind, ListingPhoto, ListingPurpose, ListingStatus, SellerRole } from './constants'

export type Listing = Readonly<{
  id: string
  reference: string
  slug: string
  status: ListingStatus
  kind: ListingKind
  purpose: ListingPurpose
  title: string
  description: string
  priceInr: number
  areaValue: number
  areaUnit: AreaUnit
  bedrooms: number | null
  city: string
  locality: string
  state: string
  images: readonly ListingPhoto[]
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  sellerRole: SellerRole
  confirmedAt: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  rejectReason: string | null
  createdAt: string
  updatedAt: string
}>

/** What the public may see of a listing: no seller contact details. */
export type PublicListing = Omit<Listing, 'sellerPhone' | 'sellerEmail' | 'reviewedBy' | 'rejectReason'>

export type NewListing = Readonly<{
  reference: string
  slug: string
  kind: ListingKind
  purpose: ListingPurpose
  title: string
  description: string
  priceInr: number
  areaValue: number
  areaUnit: AreaUnit
  bedrooms: number | null
  city: string
  locality: string
  images: readonly ListingPhoto[]
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  sellerRole: SellerRole
  confirmTokenHash: string
  confirmExpiresAt: string
}>

export type ListingEventAction = 'submitted' | 'confirmed' | 'approved' | 'rejected' | 'unpublished' | 'edited'

export type ListingEvent = Readonly<{
  id: number
  listingId: string
  action: ListingEventAction
  adminId: string | null
  adminName: string | null
  note: string | null
  createdAt: string
}>

export type ListingFilters = Readonly<{
  kind?: ListingKind
  purpose?: ListingPurpose
  city?: string
  maxPrice?: number
}>

export type Admin = Readonly<{
  id: string
  email: string
  name: string
  createdAt: string
  lastLoginAt: string | null
}>

export type AdminWithHash = Admin & Readonly<{ passwordHash: string }>

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed'

export type Subscriber = Readonly<{
  id: string
  email: string
  status: SubscriberStatus
  source: string
  createdAt: string
  confirmedAt: string | null
  unsubscribedAt: string | null
}>

export type Campaign = Readonly<{
  id: string
  subject: string
  body: string
  includeListings: boolean
  status: 'sending' | 'sent' | 'failed'
  recipients: number
  sentCount: number
  failedCount: number
  createdBy: string | null
  createdAt: string
  finishedAt: string | null
}>

export type StatusCounts = Readonly<Record<ListingStatus, number>>
