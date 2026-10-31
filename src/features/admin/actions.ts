'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { z } from 'zod'
import { nameField } from '@/features/enquiry/schema'
import { sendEmail } from '@/features/email/mailer'
import { adminWelcomeEmail, campaignEmail } from '@/features/marketplace/emails'
import { notifyDecision } from '@/features/marketplace/notify'
import { getStore } from '@/features/marketplace/runtime'
import type { ReviewDecision } from '@/features/marketplace/store'
import { listUnsubscribeHeaders, unsubscribeUrl } from '@/features/marketplace/subscriptions'
import { routes } from '@/lib/routes'
import { normalizeLine, normalizeMultiline } from '@/security/normalize'
import { hashPassword, PASSWORD_MAX, PASSWORD_MIN, verifyAgainstDummy, verifyPassword } from '@/security/password'
import { clientKey, createFailureCounter, createRateLimiter } from '@/security/rate-limit'
import type { AdminFormState } from './constants'
import { endSession, requireAdmin, startSession } from './session'

const loginPerClient = createRateLimiter({ limit: 10, windowMs: 15 * 60_000 })
const loginFailures = createFailureCounter({ limit: 5, windowMs: 15 * 60_000 })
const passwordChanges = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 })

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
  if (!loginPerClient(client).allowed || loginFailures.blocked(email)) {
    return failure('Too many attempts. Please wait 15 minutes and try again.')
  }
  try {
    const admin = await (await getStore()).getAdminByEmail(email)
    const valid = admin ? await verifyPassword(password, admin.passwordHash) : await verifyAgainstDummy(password)
    if (!admin || !valid) {
      loginFailures.fail(email)
      return failure(LOGIN_FAILED)
    }
    loginFailures.clear(email)
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
  if (!passwordChanges(admin.id).allowed) return failure('Too many attempts. Please wait 15 minutes and try again.')
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
