'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { z } from 'zod'
import { getProject, isValidSlug } from '@/content/repository'
import { projects as bundledProjects } from '@/content/fixtures/projects'
import { nameField } from '@/features/enquiry/schema'
import { sendEmail } from '@/features/email/mailer'
import { adminWelcomeEmail, campaignEmail } from '@/features/marketplace/emails'
import { NO_FEATURED } from '@/features/featured/featured'
import { photosExist } from '@/features/marketplace/media'
import { notifyDecision } from '@/features/marketplace/notify'
import { AMENITY_KEYS, isKnownPhotoRef, recordSchema, savedProjects } from '@/features/projects/content'
import { facts, homes, nearby, paragraphs, specifications, units, type Parsed } from '@/features/projects/text'
import { getStore } from '@/features/marketplace/runtime'
import type { ReviewDecision } from '@/features/marketplace/store'
import { listUnsubscribeHeaders, unsubscribeUrl } from '@/features/marketplace/subscriptions'
import { cacheTags } from '@/lib/cache-tags'
import { routes } from '@/lib/routes'
import { normalizeLine, normalizeMultiline } from '@/security/normalize'
import { hashPassword, PASSWORD_MAX, PASSWORD_MIN, verifyAgainstDummy, verifyPassword } from '@/security/password'
import { clientKey } from '@/security/rate-limit'
import { createSharedFailureCounter, createSharedLimiter } from '@/security/shared-limit'
import type { AdminFormState } from './constants'
import { endSession, requireAdmin, startSession } from './session'

const loginPerClient = createSharedLimiter('login-client', { limit: 10, windowMs: 15 * 60_000 })
const loginFailures = createSharedFailureCounter('login-failures', { limit: 5, windowMs: 15 * 60_000 })
const passwordChanges = createSharedLimiter('password-change', { limit: 5, windowMs: 15 * 60_000 })

const failure = (message: string): AdminFormState => ({ status: 'error', message })
const LOGIN_FAILED = 'That email and password do not match.'
const TRY_AGAIN = 'Something went wrong on our side. Please try again.'

const passwordError = (password: string) =>
  password.length < PASSWORD_MIN || password.length > PASSWORD_MAX
    ? `Please use a password of ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`
    : undefined

export async function login(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const email = normalizeLine(form.get('email')).toLowerCase().slice(0, 254)
  const password = String(form.get('password') ?? '').slice(0, PASSWORD_MAX)
  const client = clientKey(await headers())
  // One network can't keep guessing, and neither can anyone guessing at one address.
  if (!(await loginPerClient(client)).allowed || (await loginFailures.blocked(email))) {
    return failure('Too many attempts. Please wait 15 minutes and try again.')
  }
  try {
    const admin = await (await getStore()).getAdminByEmail(email)
    const valid = admin ? await verifyPassword(password, admin.passwordHash) : await verifyAgainstDummy(password)
    if (!admin || !valid) {
      await loginFailures.fail(email)
      return failure(LOGIN_FAILED)
    }
    await loginFailures.clear(email)
    await startSession(admin.id)
  } catch (error) {
    console.error(`[admin] login failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
  redirect(routes.admin)
}

export async function logout(): Promise<void> {
  await endSession()
  redirect(routes.adminLogin)
}

export async function reviewListing(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const id = normalizeLine(form.get('id'))
  const decision = normalizeLine(form.get('decision'))
  const reason = normalizeMultiline(form.get('reason')).slice(0, 1000)
  if (decision !== 'approved' && decision !== 'rejected' && decision !== 'unpublished') return failure('Please choose an action.')
  if (decision !== 'approved' && reason.length < 5) return failure('Please give the seller a reason.')

  let notified: boolean
  try {
    const store = await getStore()
    const before = await store.getListing(id)
    if (!before) return failure('That listing no longer exists.')
    if (before.status === 'unconfirmed') return failure('The seller has not confirmed their email yet.')
    // Another admin, or another tab, may have decided since this page was opened.
    if (before.status !== normalizeLine(form.get('expected'))) return failure('This listing has changed since you opened it. Please reload the page.')
    const listing = await store.reviewListing(id, admin.id, decision as ReviewDecision, reason || undefined)
    if (!listing) return failure('This listing has already changed. Please reload the page.')
    notified = await notifyDecision(listing, decision, reason || undefined)
    updateTag(cacheTags.listings)
    revalidatePath(routes.marketplace)
  } catch (error) {
    console.error(`[admin] review failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
  // The form that sent this disappears once the status changes, so the outcome travels in the URL.
  redirect(`${routes.adminListing(id)}?done=${decision}&mail=${notified ? 'sent' : 'failed'}`)
}

const campaignSchema = z.object({
  subject: z.string().min(3, 'Please write a subject.').max(150, 'Please keep the subject under 150 characters.'),
  body: z.string().min(10, 'Please write the message.').max(20_000, 'Please keep the message under 20,000 characters.'),
})

/** Chooses the project shown in the home-page spotlight and the hero card. */
export async function setFeaturedProject(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const slug = normalizeLine(form.get('project'))
  const project = isValidSlug(slug) ? await getProject(slug) : undefined
  if (!project && slug !== NO_FEATURED) return failure('Please choose a project.')
  try {
    await (await getStore()).setFeaturedProject(project?.slug ?? NO_FEATURED, admin.id)
  } catch (error) {
    console.error(`[admin] featured failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
  updateTag(cacheTags.featured)
  revalidatePath(routes.home)
  revalidatePath(routes.adminProjects)
  return { status: 'ok', message: project ? `${project.name} is now featured on the home page.` : 'No project is featured on the home page now.' }
}

/** Saves an admin's edits to a project. Lists arrive as text; see features/projects/text. */
export async function saveProject(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const slug = normalizeLine(form.get('slug'))
  if (!isValidSlug(slug) || !bundledProjects.some((p) => p.slug === slug)) return failure('That project no longer exists.')

  const field = (name: string) => {
    const value = form.get(name)
    return typeof value === 'string' ? value.slice(0, 20_000) : ''
  }
  const lists: Record<string, Parsed<readonly unknown[]>> = {
    configurations: homes.parse(field('configurations')),
    facts: facts.parse(field('facts')),
    specifications: specifications.parse(field('specifications')),
    nearby: nearby.parse(field('nearby')),
    units: units.parse(field('units')),
  }
  for (const list of Object.values(lists)) if (!list.ok) return failure(list.message)
  const value = (name: string) => (lists[name] as Readonly<{ ok: true; value: readonly unknown[] }>).value

  let photos: unknown
  try {
    photos = JSON.parse(field('photos') || '[]')
  } catch {
    return failure('Photos: please upload them again.')
  }

  const parsed = recordSchema.safeParse({
    name: normalizeLine(field('name')),
    tagline: normalizeLine(field('tagline')),
    summary: normalizeLine(field('summary')),
    type: field('type'),
    status: field('status'),
    possession: normalizeLine(field('possession')),
    address: normalizeLine(field('address')),
    description: paragraphs.parse(normalizeMultiline(field('description'))),
    configurations: value('configurations'),
    facts: value('facts'),
    amenities: form.getAll('amenities').filter((a): a is string => typeof a === 'string' && (AMENITY_KEYS as readonly string[]).includes(a)),
    specifications: value('specifications'),
    nearby: value('nearby'),
    units: value('units'),
    photos,
  })
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Please check the form.')
  const record = parsed.data
  if (!record.photos.every((photo) => isKnownPhotoRef(photo.ref))) return failure('Photos: please upload them again.')

  try {
    // Photos saved before are trusted; a new upload must really exist on the photo host.
    const before = new Set((await savedProjects())[slug]?.record.photos.map((p) => p.ref) ?? [])
    const fresh = record.photos.filter((p) => p.ref.startsWith('upload:') && !before.has(p.ref))
    if (fresh.length > 0 && !(await photosExist(fresh.map((p) => ({ id: p.ref.slice('upload:'.length), width: p.width, height: p.height }))))) {
      return failure('One of the new photos did not upload properly. Please add it again.')
    }
    await (await getStore()).saveProjectRecord(slug, record, admin.id)
  } catch (error) {
    console.error(`[admin] project save failed ${JSON.stringify({ slug, error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
  updateTag(cacheTags.projects)
  for (const path of [routes.home, routes.projects, routes.project(slug), routes.adminProjects, routes.adminProject(slug)]) revalidatePath(path)
  return { status: 'ok', message: `Saved. ${record.name} is updated on the website.` }
}

/** Pause between messages: Gmail and Workspace throttle bursts from one mailbox. */
const SEND_GAP_MS = 400

export async function sendCampaign(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const parsed = campaignSchema.safeParse({ subject: normalizeLine(form.get('subject')), body: normalizeMultiline(form.get('body')) })
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Please check the form.')
  const includeListings = form.get('includeListings') === 'on'

  try {
    const store = await getStore()
    const emails = await store.activeSubscriberEmails()
    if (emails.length === 0) return failure('There are no confirmed subscribers yet.')
    const { items: listings } = includeListings ? await store.listListings({ status: 'approved', limit: 4 }) : { items: [] }
    const campaign = await store.createCampaign({ ...parsed.data, includeListings, recipients: emails.length, createdBy: admin.id })

    // Sends continue after the response; progress shows on the campaigns page.
    after(async () => {
      let sentCount = 0
      let failedCount = 0
      try {
        for (const email of emails) {
          const sent = await sendEmail({
            to: { address: email },
            message: campaignEmail(parsed.data, listings, unsubscribeUrl(email)),
            headers: listUnsubscribeHeaders(email),
            tag: `campaign ${campaign.id}`,
          })
          if (sent) sentCount += 1
          else failedCount += 1
          await new Promise((resolve) => setTimeout(resolve, SEND_GAP_MS))
        }
      } finally {
        // Whatever happened, the campaign must not sit at "sending" forever.
        await store.finishCampaign(campaign.id, { sentCount, failedCount }).catch((error: unknown) => {
          console.error(`[admin] campaign finish failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
        })
      }
    })
    revalidatePath(routes.adminCampaigns)
    return { status: 'ok', message: `Sending to ${emails.length} ${emails.length === 1 ? 'subscriber' : 'subscribers'}.` }
  } catch (error) {
    console.error(`[admin] campaign failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
}

export async function addAdmin(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const name = nameField.safeParse(normalizeLine(form.get('name')))
  const email = z.email().max(254).safeParse(normalizeLine(form.get('email')).toLowerCase())
  const password = String(form.get('password') ?? '')
  if (!name.success) return failure('Please enter their name, in letters only.')
  if (!email.success) return failure('Please enter a valid email address.')
  const weak = passwordError(password)
  if (weak) return failure(weak)
  try {
    const created = await (await getStore()).createAdmin({
      email: email.data,
      name: name.data,
      passwordHash: await hashPassword(password),
      createdBy: admin.id,
    })
    if (created === 'exists') return failure('That email already has an admin account.')
    const notified = await sendEmail({
      to: { name: created.name, address: created.email },
      message: adminWelcomeEmail(created.name, created.email, admin.name),
      tag: 'admin-welcome',
    })
    revalidatePath(routes.adminTeam)
    return { status: 'ok', message: notified ? `${created.name} added and emailed. Share the password with them directly.` : `${created.name} added. The welcome email could not be sent.` }
  } catch (error) {
    console.error(`[admin] add failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
}

export async function removeAdmin(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const id = normalizeLine(form.get('id'))
  if (id === admin.id) return failure('You cannot remove your own account.')
  try {
    const store = await getStore()
    // Sessions go first, so a removed admin is signed out everywhere immediately.
    await store.deleteSessionsFor(id)
    await store.deleteAdmin(id)
    revalidatePath(routes.adminTeam)
    return { status: 'ok', message: 'Admin removed and signed out.' }
  } catch (error) {
    console.error(`[admin] remove failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
}

/** Sets a new password for a colleague who is locked out, and signs them out everywhere. */
export async function resetAdminPassword(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  const id = normalizeLine(form.get('id'))
  const password = String(form.get('password') ?? '')
  const weak = passwordError(password)
  if (weak) return failure(weak)
  if (id === admin.id) return failure('Use the Account page to change your own password.')
  try {
    const store = await getStore()
    if (!(await store.getAdmin(id))) return failure('That admin no longer exists.')
    await store.setAdminPassword(id, await hashPassword(password))
    await store.deleteSessionsFor(id)
    return { status: 'ok', message: 'Password reset. Share it with them directly.' }
  } catch (error) {
    console.error(`[admin] reset failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
}

export async function changeOwnPassword(_previous: AdminFormState, form: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin()
  if (!(await passwordChanges(admin.id)).allowed) return failure('Too many attempts. Please wait 15 minutes and try again.')
  const current = String(form.get('current') ?? '')
  const next = String(form.get('next') ?? '')
  const weak = passwordError(next)
  if (weak) return failure(weak)
  try {
    const store = await getStore()
    const record = await store.getAdminByEmail(admin.email)
    if (!record || !(await verifyPassword(current.slice(0, PASSWORD_MAX), record.passwordHash))) {
      return failure('Your current password is not right.')
    }
    await store.setAdminPassword(admin.id, await hashPassword(next))
    // Any other device signed in as this admin is signed out; this one signs in afresh.
    await store.deleteSessionsFor(admin.id)
    await startSession(admin.id)
    return { status: 'ok', message: 'Password changed. Other devices have been signed out.' }
  } catch (error) {
    console.error(`[admin] password change failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    return failure(TRY_AGAIN)
  }
}
