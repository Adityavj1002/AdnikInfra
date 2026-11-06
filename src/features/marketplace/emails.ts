import 'server-only'
import { site } from '@/config/site'
import { renderEmail, type EmailBlock, type RenderedEmail } from '@/features/email/layout'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'
import { listingKindLabels, listingPurposeLabels, sellerRoleLabels } from './constants'
import { listingArea, listingPlace, listingPrice, listingSummary } from './format'
import { photoUrl } from '@/features/media/media'
import type { Listing, PublicListing } from './types'

/** Every marketplace email, in the shared layout. Links are absolute, built from SITE_URL. */

const at = (path: string) => new URL(path, env.SITE_URL).href

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

/** The listing's details; seller emails show the reference in its own card instead. */
function listingRows(listing: Listing, withReference = true): EmailBlock {
  return {
    type: 'rows',
    rows: [
      ['Reference', withReference ? listing.reference : null],
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

type Stage = 'submitted' | 'confirmed' | 'live' | 'changes'

/** The listing's journey, as the seller sees it in every email: done, now, next. */
function journey(stage: Stage): EmailBlock {
  const reached = { submitted: 0, confirmed: 1, live: 3, changes: 2 }[stage]
  const state = (step: number) => (step < reached || stage === 'live' ? 'done' : step === reached ? 'current' : 'next') as 'done' | 'current' | 'next'
  return {
    type: 'steps',
    steps: [
      { label: 'Listing submitted', detail: 'Your details and photos reached us.', state: 'done' },
      { label: 'Email confirmed', detail: 'One click on the link we sent you.', state: state(1) },
      stage === 'changes'
        ? { label: 'Changes needed', detail: 'Our team could not publish it as it is: see the reason above.', state: 'current' }
        : { label: 'Checked by our team', detail: 'Details and photos checked, usually within one or two working days.', state: state(2) },
      { label: 'Live on the marketplace', detail: 'Buyers can find it, and their enquiries reach our team first.', state: state(3) },
    ],
  }
}

const reference = (listing: Listing): EmailBlock => ({
  type: 'reference',
  label: 'Listing reference',
  value: listing.reference,
  note: 'Quote it whenever you call, WhatsApp or write to us about this property.',
})

export function listingConfirmEmail(listing: Listing, confirmUrl: string): RenderedEmail {
  return renderEmail({
    subject: `Confirm your listing: ${listing.title} [${listing.reference}]`,
    preheader: 'One click and your property goes to our team for review.',
    eyebrow: 'Marketplace · Step 2 of 4',
    title: 'Please confirm your listing',
    blocks: [
      { type: 'p', text: `Hello ${listing.sellerName}, thank you for listing your property on ${site.name}.` },
      { type: 'p', text: 'Confirm your email address and we will send the listing to our team for review.' },
      { type: 'button', label: 'Confirm my listing', url: confirmUrl },
      { type: 'note', text: `This link works for ${CONFIRM_HOURS} hours. If you did not list a property with us, ignore this email and nothing will be published.` },
      reference(listing),
      { type: 'heading', text: 'Where your listing stands' },
      journey('submitted'),
      { type: 'heading', text: 'Your listing' },
      listingRows(listing, false),
      { type: 'contact', title: 'Questions about your listing?' },
    ],
    reason: `You received this because this address was entered on the ${site.name} sell form.`,
  })
}

export function listingReceivedEmail(listing: Listing): RenderedEmail {
  return renderEmail({
    subject: `We have your listing: ${listing.title} [${listing.reference}]`,
    preheader: 'Email confirmed. Your property is in our review queue.',
    eyebrow: 'Marketplace · Step 3 of 4',
    title: 'Your listing is with our team',
    blocks: [
      { type: 'p', text: `Thank you, ${listing.sellerName}. Your email is confirmed and the listing is now waiting for review.` },
      reference(listing),
      { type: 'heading', text: 'Where your listing stands' },
      journey('confirmed'),
      {
        type: 'list',
        items: [
          'We may call you on the number you gave to verify the property.',
          'You will get an email the moment it is approved and live, or if anything needs changing.',
        ],
      },
      { type: 'heading', text: 'Your listing' },
      listingRows(listing, false),
      { type: 'contact', title: 'Questions about your listing?' },
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
    eyebrow: 'Marketplace · Live',
    title: 'Good news: your listing is live',
    blocks: [
      { type: 'p', text: `Hello ${listing.sellerName}, our team has approved your listing. Buyers can see it now.` },
      { type: 'button', label: 'See your listing', url },
      reference(listing),
      { type: 'heading', text: 'Where your listing stands' },
      journey('live'),
      {
        type: 'list',
        items: [
          'Enquiries come to our team first; we pass serious buyers on to you by phone.',
          `To change the price or details, or to take it down once sold, reply quoting ${listing.reference}.`,
        ],
      },
      { type: 'heading', text: 'Your listing' },
      listingRows(listing, false),
      { type: 'contact', title: 'Talk to our team' },
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
      reference(listing),
      ...(unpublished ? [] : [{ type: 'heading' as const, text: 'Where your listing stands' }, journey('changes')]),
      { type: 'heading', text: 'Your listing' },
      listingRows(listing, false),
      { type: 'contact', title: 'Want help fixing it?' },
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
      { type: 'contact', title: 'Looking for something specific?' },
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
