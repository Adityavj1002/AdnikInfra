import 'server-only'
import { sendEmail, teamInbox, type Address } from '@/features/email/mailer'
import { listingApprovedEmail, listingForReviewEmail, listingReceivedEmail, listingRejectedEmail } from './emails'
import type { MarketplaceStore } from './store'
import type { Listing } from './types'

/** Every admin, plus the shared inbox, once each. */
async function reviewers(store: MarketplaceStore): Promise<readonly Address[]> {
  const admins = await store.listAdmins()
  const team = teamInbox()
  const seen = new Set<string>([team.address])
  const list: Address[] = [team]
  for (const admin of admins) {
    if (seen.has(admin.email)) continue
    seen.add(admin.email)
    list.push({ name: admin.name, address: admin.email })
  }
  return list
}

const seller = (listing: Listing): Address => ({ name: listing.sellerName, address: listing.sellerEmail })

/** After the seller confirms: tell them it's queued, and tell the admins there's work. */
export async function notifyConfirmed(store: MarketplaceStore, listing: Listing): Promise<void> {
  const team = await reviewers(store)
  await Promise.all([
    sendEmail({ to: seller(listing), message: listingReceivedEmail(listing), tag: `listing-received ${listing.reference}` }),
    sendEmail({
      to: team,
      message: listingForReviewEmail(listing),
      replyTo: seller(listing),
      tag: `listing-review ${listing.reference}`,
    }),
  ])
}

export async function notifyDecision(listing: Listing, decision: 'approved' | 'rejected' | 'unpublished', reason?: string): Promise<boolean> {
  const message =
    decision === 'approved'
      ? listingApprovedEmail(listing)
      : listingRejectedEmail(listing, reason ?? 'It did not meet our listing guidelines.', decision === 'unpublished')
  return sendEmail({ to: seller(listing), message, replyTo: teamInbox(), tag: `listing-${decision} ${listing.reference}` })
}
