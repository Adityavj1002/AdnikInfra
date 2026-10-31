import 'server-only'
import { site } from '@/config/site'
import { renderEmail, type EmailBlock, type RenderedEmail } from '@/features/email/layout'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { listingKindLabels, listingPurposeLabels, sellerRoleLabels } from './constants'
import { listingArea, listingPlace, listingPrice, listingSummary } from './format'
import { photoUrl } from './media'
import type { Listing, PublicListing } from './types'

/** Every marketplace email, in the shared layout. Links are absolute, built from SITE_URL. */

const at = (path: string) => new URL(path, env.SITE_URL).href

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

function listingRows(listing: Listing): EmailBlock {
  return {
    type: 'rows',
    rows: [
      ['Reference', listing.reference],
      ['Title', listing.title],
      ['Type', `${listingKindLabels[listing.kind]}, ${listingPurposeLabels[listing.purpose].toLowerCase()}`],
      ['Price', listingPrice(listing)],
      ['Area', listingArea(listing)],
      ['Bedrooms', listing.bedrooms === null ? null : String(listing.bedrooms)],
      ['Location', `${listingPlace(listing)}, ${listing.state}`],
      ['Photos', String(listing.images.length)],
    ],
  }
}

export const CONFIRM_HOURS = 72

export function listingConfirmEmail(listing: Listing, confirmUrl: string): RenderedEmail {
  return renderEmail({
    subject: `Confirm your listing: ${listing.title} [${listing.reference}]`,
    preheader: 'One click and your property goes to our team for review.',
    eyebrow: 'Marketplace',
    title: 'Please confirm your listing',
    blocks: [
      { type: 'p', text: `Hello ${listing.sellerName}, thank you for listing your property on ${site.name}.` },
      { type: 'p', text: 'Confirm your email address and we will send the listing to our team for review.' },
      { type: 'button', label: 'Confirm my listing', url: confirmUrl },
      listingRows(listing),
      { type: 'note', text: `This link works for ${CONFIRM_HOURS} hours. If you did not list a property with us, ignore this email and nothing will be published.` },
    ],
    reason: `You received this because this address was entered on the ${site.name} sell form.`,
  })
}

export function listingReceivedEmail(listing: Listing): RenderedEmail {
  return renderEmail({
    subject: `We have your listing: ${listing.title} [${listing.reference}]`,
    preheader: 'Your property is in our review queue.',
    eyebrow: 'Marketplace',
    title: 'Your listing is with our team',
    blocks: [
      { type: 'p', text: `Thank you, ${listing.sellerName}. Your email is confirmed and the listing is now waiting for review.` },
      {
        type: 'list',
        items: [
          'Our team checks the details and photos, usually within one or two working days.',
          'We may call you on the number you gave to verify the property.',
          'You will get an email the moment it is approved and live, or if anything needs changing.',
        ],
      },
      listingRows(listing),
      { type: 'note', text: `Quote ${listing.reference} if you write to us about this listing.` },
    ],
    reason: `You received this because you listed a property on ${site.name}.`,
  })
}

export function listingForReviewEmail(listing: Listing): RenderedEmail {
  return renderEmail({
    subject: `New listing to review: ${listing.title} [${listing.reference}]`,
    preheader: `${listingSummary(listing)} · ${listingPlace(listing)} · ${listingPrice(listing)}`,
    eyebrow: 'Admin · Review queue',
    title: 'A new listing is waiting for review',
    blocks: [
      { type: 'p', text: 'The seller has confirmed their email. It stays hidden until an admin approves it.' },
      { type: 'button', label: 'Review in the admin panel', url: at(routes.adminListing(listing.id)) },
      listingRows(listing),
      {
        type: 'rows',
        rows: [
          ['Seller', `${listing.sellerName} (${sellerRoleLabels[listing.sellerRole]})`],
          ['Phone', listing.sellerPhone],
          ['Email', listing.sellerEmail],
          ['Confirmed', listing.confirmedAt ? `${when.format(new Date(listing.confirmedAt))} IST` : null],
        ],
      },
      { type: 'quote', label: 'Description', text: listing.description },
    ],
    reason: `You received this because you are an admin of the ${site.name} marketplace.`,
  })
}

export function listingApprovedEmail(listing: Listing): RenderedEmail {
  const url = at(routes.marketplaceListing(listing.slug))
  return renderEmail({
    subject: `Your listing is live: ${listing.title} [${listing.reference}]`,
    preheader: 'Approved and published on the marketplace.',
    eyebrow: 'Marketplace',
    title: 'Good news: your listing is live',
    blocks: [
      { type: 'p', text: `Hello ${listing.sellerName}, our team has approved your listing. Buyers can see it now.` },
      { type: 'button', label: 'See your listing', url },
      { type: 'p', text: 'Enquiries come to our team first; we pass serious buyers on to you by phone.' },
      listingRows(listing),
      { type: 'note', text: `To change or remove the listing, reply to this email quoting ${listing.reference}.` },
    ],
    reason: `You received this because you listed a property on ${site.name}.`,
  })
}

export function listingRejectedEmail(listing: Listing, reason: string, unpublished: boolean): RenderedEmail {
  return renderEmail({
    subject: `${unpublished ? 'Your listing was taken down' : 'Your listing needs changes'}: ${listing.title} [${listing.reference}]`,
    preheader: 'Our team could not publish this listing as it is.',
    eyebrow: 'Marketplace',
    title: unpublished ? 'Your listing has been taken down' : 'We could not publish your listing',
    blocks: [
      { type: 'p', text: `Hello ${listing.sellerName}, thank you for using the ${site.name} marketplace.` },
      { type: 'quote', label: 'Reason from our team', text: reason },
      { type: 'p', text: 'You are welcome to submit the property again with the details fixed.' },
      { type: 'button', label: 'List a property', url: at(routes.marketplaceSell) },
      listingRows(listing),
      { type: 'note', text: `Questions? Reply to this email quoting ${listing.reference}.` },
    ],
    reason: `You received this because you listed a property on ${site.name}.`,
  })
}

export function subscribeConfirmEmail(confirmUrl: string): RenderedEmail {
  return renderEmail({
    subject: `Confirm your subscription to ${site.name}`,
    preheader: 'One click to start getting new listings and offers.',
    eyebrow: 'Newsletter',
    title: 'Please confirm your subscription',
    blocks: [
      { type: 'p', text: `Thanks for signing up for updates from ${site.name}: new properties on the marketplace, projects and occasional offers.` },
      { type: 'button', label: 'Yes, subscribe me', url: confirmUrl },
      { type: 'note', text: 'If you did not sign up, ignore this email and you will not hear from us again.' },
    ],
    reason: `You received this because this address was entered in the subscribe form on the ${site.name} website.`,
  })
}

export function subscribeWelcomeEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: `You're subscribed to ${site.name}`,
    preheader: 'New listings and offers, a few times a month at most.',
    eyebrow: 'Newsletter',
    title: 'You are subscribed',
    blocks: [
      { type: 'p', text: 'You will hear from us when there is something worth sharing: new properties, projects and offers. A few emails a month at most.' },
      { type: 'button', label: 'Browse the marketplace', url: at(routes.marketplace) },
    ],
    unsubscribeUrl,
    reason: `You received this because you subscribed on the ${site.name} website.`,
  })
}

/** Plain text in, paragraphs out: admins write campaigns as text, never as HTML. */
export function campaignEmail(
  campaign: Readonly<{ subject: string; body: string }>,
  listings: readonly PublicListing[],
  unsubscribeUrl: string,
): RenderedEmail {
  const paragraphs = campaign.body
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean)
  return renderEmail({
    subject: campaign.subject,
    preheader: paragraphs[0]?.slice(0, 120) ?? campaign.subject,
    eyebrow: site.name,
    title: campaign.subject,
    blocks: [
      ...paragraphs.map((text): EmailBlock => ({ type: 'p', text })),
      ...(listings.length > 0
        ? [
            { type: 'p' as const, text: 'New on the marketplace' },
            {
              type: 'cards' as const,
              cards: listings.map((listing) => ({
                title: listing.title,
                meta: `${listingSummary(listing)} · ${listingPlace(listing)} · ${listingPrice(listing)}`,
                url: at(routes.marketplaceListing(listing.slug)),
                image: listing.images[0] ? photoUrl(listing.images[0].id, 280, env.SITE_URL) : undefined,
              })),
            },
            { type: 'button' as const, label: 'See all listings', url: at(routes.marketplace) },
          ]
        : []),
    ],
    unsubscribeUrl,
    reason: `You received this because you subscribed to updates from ${site.name}.`,
  })
}

export function adminWelcomeEmail(name: string, email: string, createdBy: string): RenderedEmail {
  return renderEmail({
    subject: `You are now an admin of the ${site.name} website`,
    preheader: `${createdBy} added you to the admin panel.`,
    eyebrow: 'Admin',
    title: 'Your admin account is ready',
    blocks: [
      { type: 'p', text: `Hello ${name}, ${createdBy} has given you an admin account for the ${site.name} website.` },
      { type: 'rows', rows: [['Sign-in email', email]] },
      { type: 'p', text: `${createdBy} will share your first password with you directly. Change it after you sign in.` },
      { type: 'button', label: 'Open the admin panel', url: at(routes.adminLogin) },
    ],
    reason: `You received this because an admin added this address to the ${site.name} admin panel.`,
  })
}
