'use client'

import { Send, Upload, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { startTransition, useActionState, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react'
import { Honeypot, ErrorSummary, Field } from '@/features/enquiry/FormParts'
import formStyles from '@/features/enquiry/Form.module.css'
import { compactPhone, isEmail, isPhone, isPersonName } from '@/features/enquiry/validation'
import { routes } from '@/lib/routes'
import { requestUploadTicket, submitListing } from './actions'
import {
  AREA_UNITS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  KINDS_WITH_BEDROOMS,
  LISTING_KINDS,
  LISTING_PURPOSES,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  PHOTOS_MAX,
  SELLER_ROLES,
  TITLE_MAX,
  TITLE_MIN,
  areaUnitLabels,
  initialListingFormState,
  listingKindLabels,
  listingPurposeLabels,
  sellerRoleLabels,
  type ListingKind,
  type ListingPhoto,
} from './constants'
import { MarketImage } from './MarketImage'
import styles from './marketplace.module.css'

const labels = {
  kind: 'Property type',
  purpose: 'Sale or rent',
  title: 'Listing title',
  description: 'Description',
  price: 'Price (₹)',
  areaValue: 'Area',
  areaUnit: 'Area unit',
  bedrooms: 'Bedrooms',
  city: 'City or town',
  locality: 'Locality or area',
  photos: 'Photos',
  sellerName: 'Your name',
  sellerPhone: 'Mobile number',
  sellerEmail: 'Email',
  sellerRole: 'You are the',
  consent: 'Confirmation',
} as const

type Errors = Partial<Record<string, string>>
type Values = Partial<Record<string, string>>

const CHECKED = ['kind', 'title', 'description', 'price', 'areaValue', 'areaUnit', 'city', 'locality', 'sellerName', 'sellerPhone', 'sellerEmail', 'consent'] as const

/** Browser-side check mirroring the server schema, so mistakes show before a round trip. */
function validate(values: Values): Errors {
  const errors: Errors = {}
  const text = (key: string) => values[key]?.trim() ?? ''
  if (!text('kind')) errors.kind = 'Please choose the property type.'
  if (text('title').length < TITLE_MIN) errors.title = `Please write a title of at least ${TITLE_MIN} characters.`
  if (text('description').length < DESCRIPTION_MIN) errors.description = `Please describe the property in at least ${DESCRIPTION_MIN} characters.`
  const price = text('price').replace(/[\s,₹]/g, '')
  if (!/^\d{1,12}$/.test(price) || Number(price) < 1000) errors.price = 'Please enter the full price in rupees, e.g. 4500000 for ₹45 lakh.'
  const area = text('areaValue').replace(/[\s,]/g, '')
  if (!/^\d{1,9}$|^\d{1,9}\.\d{1,2}$/.test(area) || Number(area) <= 0) errors.areaValue = 'Please enter the area as a number, e.g. 1200 or 2.5.'
  if (!text('areaUnit')) errors.areaUnit = 'Please choose the area unit.'
  if (text('city').length < 2) errors.city = 'Please enter the city.'
  if (text('locality').length < 2) errors.locality = 'Please enter the locality or area.'
  const name = text('sellerName')
  if (name.length < 2) errors.sellerName = 'Please enter your name.'
  else if (!isPersonName(name)) errors.sellerName = 'Please use letters only.'
  if (!isPhone(compactPhone(text('sellerPhone')))) errors.sellerPhone = 'Please enter a valid mobile number, e.g. 98290 12345.'
  if (!isEmail(text('sellerEmail'))) errors.sellerEmail = 'Please enter a valid email address.'
  if (values.consent !== 'on') errors.consent = 'Please confirm so we can review your listing.'
  return errors
}

function readForm(form: HTMLFormElement): Values {
  const values: Values = {}
  for (const [key, value] of new FormData(form)) if (typeof value === 'string') values[key] = value
  return values
}

function parseInitialPhotos(raw: string | undefined): readonly ListingPhoto[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]')
    return Array.isArray(value) ? (value as ListingPhoto[]) : []
  } catch {
    return []
  }
}

async function dimensions(file: File): Promise<Readonly<{ width: number; height: number }>> {
  try {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  } catch {
    // HEIC and the like can't be decoded in every browser; Cloudinary reports real sizes anyway.
    return { width: 1600, height: 1200 }
  }
}

/** Seller's own form: photos go straight to the image host, details go through the server action. */
export function SellForm({ photoBase }: Readonly<{ photoBase: string }>) {
  const [state, action, pending] = useActionState(submitListing, initialListingFormState)
  const values: Values = state.status === 'error' ? state.values : {}
  const serverErrors: Errors = state.status === 'error' ? state.errors : {}

  const [live, setLive] = useState<Errors>({})
  const [summary, setSummary] = useState<Errors | null>(null)
  const [photos, setPhotos] = useState<readonly ListingPhoto[]>(() => parseInitialPhotos(values.photos))
  const [previews, setPreviews] = useState<Readonly<Record<string, string>>>({})
  const [uploading, setUploading] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [kind, setKind] = useState<string>(values.kind ?? '')
  const [seen, setSeen] = useState(state)
  const fileInput = useRef<HTMLInputElement>(null)

  if (seen !== state) {
    setSeen(state)
    setLive({})
    setSummary(null)
    setKind(values.kind ?? '')
    if (state.status === 'error') setPhotos(parseInitialPhotos(values.photos))
  }

  if (state.status === 'success') {
    return (
      <div className={styles.statusPanel} role="status">
        <h2>Please check your email</h2>
        <p>
          We sent a confirmation link{state.email ? ` to ${state.email}` : ''}. Your listing goes to our team only after you click it.
        </p>
        <p>
          Your reference is <strong>{state.reference}</strong>. If it isn’t in your inbox within a few minutes, look in spam.
        </p>
      </div>
    )
  }

  const errors: Errors = { ...serverErrors, ...live }
  const summaryErrors = summary ?? (state.status === 'error' ? serverErrors : null)
  const showBedrooms = KINDS_WITH_BEDROOMS.includes(kind as ListingKind)

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    setUploadError('')
    const room = PHOTOS_MAX - photos.length - uploading
    if (files.length > room) setUploadError(`You can add up to ${PHOTOS_MAX} photos.`)
    for (const file of files.slice(0, Math.max(0, room))) {
      // Some browsers report no type for HEIC photos from iPhones.
      const heic = file.type === '' && /\.hei[cf]$/i.test(file.name)
      if (!heic && !(PHOTO_TYPES as readonly string[]).includes(file.type)) {
        setUploadError(`${file.name}: please use a JPG, PNG, WebP or HEIC photo.`)
        continue
      }
      if (file.size > PHOTO_MAX_BYTES) {
        setUploadError(`${file.name} is larger than 10 MB. Please choose a smaller photo.`)
        continue
      }
      setUploading((count) => count + 1)
      try {
        const ticket = await requestUploadTicket()
        if (!ticket.ok) throw new Error(ticket.reason)
        const body = new FormData()
        for (const [key, value] of Object.entries(ticket.fields)) body.set(key, value)
        body.set('file', file)
        const response = await fetch(ticket.url, { method: 'POST', body })
        if (!response.ok) throw new Error(String(response.status))
        const result = (await response.json()) as { public_id: string; width?: number; height?: number }
        const size = result.width && result.height ? { width: result.width, height: result.height } : await dimensions(file)
        setPreviews((current) => ({ ...current, [result.public_id]: URL.createObjectURL(file) }))
        setPhotos((current) => [...current, { id: result.public_id, ...size }])
        setLive((current) => ({ ...current, photos: undefined }))
      } catch {
        setUploadError(`${file.name} did not upload. Please check your connection and try again.`)
      } finally {
        setUploading((count) => count - 1)
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const found = validate(readForm(event.currentTarget))
    if (photos.length === 0) found.photos = 'Please add at least one photo of the property.'
    setLive(Object.fromEntries([...CHECKED, 'photos'].map((field) => [field, found[field]])))
    // Dispatched by hand: React resets a form after a plain action, which clears the selects.
    event.preventDefault()
    if (Object.keys(found).length > 0 || uploading > 0) {
      setSummary(found)
    } else {
      setSummary(null)
      const data = new FormData(event.currentTarget)
      startTransition(() => action(data))
    }
  }

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const field = event.target
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
    const { name, value } = field
    if (!(CHECKED as readonly string[]).includes(name) || name === 'consent') return
    if (value.trim() === '' && !errors[name]) return
    const found = validate(readForm(event.currentTarget))
    setLive((current) => ({ ...current, [name]: found[name] }))
  }

  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target
    if (target instanceof HTMLInputElement && target.name === 'sellerPhone') target.value = target.value.replace(/[^\d+\s()-]/g, '')
    if (target instanceof HTMLSelectElement && target.name === 'kind') setKind(target.value)
    const flagged = CHECKED.filter((field) => errors[field])
    if (flagged.length === 0) return
    const found = validate(readForm(event.currentTarget))
    setLive((current) => ({ ...current, ...Object.fromEntries(flagged.map((field) => [field, found[field]])) }))
  }

  return (
    <form action={action} onSubmit={handleSubmit} onBlur={handleBlur} onChange={handleChange} className={formStyles.form} noValidate>
      {(state.status === 'unavailable' || state.status === 'rate-limited') && (
        <div className={`${formStyles.panel} ${formStyles.panelWarn}`} role="alert">
          <p>
            {state.status === 'rate-limited'
              ? 'You have sent several listings from this connection. Please wait a while and try again.'
              : 'We could not take your listing just now because of a problem on our side. Please try again in a few minutes.'}
          </p>
        </div>
      )}
      {summaryErrors && Object.keys(summaryErrors).length > 0 && <ErrorSummary errors={summaryErrors} labels={labels} />}

      <div className={formStyles.row}>
        <Field name="kind" label={labels.kind} error={errors.kind}>
          {(control) => (
            <select {...control} className="select" required defaultValue={values.kind ?? ''}>
              <option value="">Choose…</option>
              {LISTING_KINDS.map((value) => (
                <option key={value} value={value}>
                  {listingKindLabels[value]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field name="purpose" label={labels.purpose} error={errors.purpose}>
          {(control) => (
            <select {...control} className="select" defaultValue={values.purpose ?? 'sale'}>
              {LISTING_PURPOSES.map((value) => (
                <option key={value} value={value}>
                  {listingPurposeLabels[value]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field name="title" label={labels.title} hint="For example: 200 gaj corner plot near Ajmer Road" error={errors.title}>
        {(control) => <input {...control} className="input" type="text" required maxLength={TITLE_MAX} defaultValue={values.title} />}
      </Field>

      <Field name="description" label={labels.description} hint="Road width, facing, approvals, ownership papers, nearby landmarks." error={errors.description}>
        {(control) => <textarea {...control} className="textarea" rows={6} required maxLength={DESCRIPTION_MAX} defaultValue={values.description} />}
      </Field>

      <div className={formStyles.row}>
        <Field name="price" label={labels.price} hint="Full amount in rupees. For rent, the monthly rent." error={errors.price}>
          {(control) => <input {...control} className="input" type="text" inputMode="numeric" required maxLength={20} placeholder="4500000" defaultValue={values.price} />}
        </Field>
        <Field name="areaValue" label={labels.areaValue} error={errors.areaValue}>
          {(control) => <input {...control} className="input" type="text" inputMode="decimal" required maxLength={14} placeholder="200" defaultValue={values.areaValue} />}
        </Field>
      </div>

      <div className={formStyles.row}>
        <Field name="areaUnit" label={labels.areaUnit} error={errors.areaUnit}>
          {(control) => (
            <select {...control} className="select" required defaultValue={values.areaUnit ?? 'sqyd'}>
              {AREA_UNITS.map((value) => (
                <option key={value} value={value}>
                  {areaUnitLabels[value]}
                </option>
              ))}
            </select>
          )}
        </Field>
        {showBedrooms && (
          <Field name="bedrooms" label={labels.bedrooms} optional error={errors.bedrooms}>
            {(control) => (
              <select {...control} className="select" defaultValue={values.bedrooms ?? ''}>
                <option value="">Not specified</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count} BHK
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
      </div>

      <div className={formStyles.row}>
        <Field name="city" label={labels.city} error={errors.city}>
          {(control) => <input {...control} className="input" type="text" required maxLength={80} autoComplete="address-level2" defaultValue={values.city} />}
        </Field>
        <Field name="locality" label={labels.locality} error={errors.locality}>
          {(control) => <input {...control} className="input" type="text" required maxLength={80} defaultValue={values.locality} />}
        </Field>
      </div>

      <div className="field">
        <p className="field__label">{labels.photos}</p>
        <p className="field__hint">
          Up to {PHOTOS_MAX} photos, 10 MB each. Clear daylight photos get the most enquiries.
        </p>
        {errors.photos && (
          <p id="field-photos-error" className="field__error">
            {errors.photos}
          </p>
        )}
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
        <input
          ref={fileInput}
          type="file"
          accept={PHOTO_TYPES.join(',')}
          multiple
          className="visually-hidden"
          tabIndex={-1}
          aria-label="Choose photos"
          onChange={addFiles}
        />
        <div>
          <button id="field-photos" type="button" className="button button--outline" disabled={photos.length + uploading >= PHOTOS_MAX} onClick={() => fileInput.current?.click()}>
            <Upload aria-hidden="true" strokeWidth={1.75} />
            Add photos
          </button>
        </div>
        <p className={styles.uploadStatus} role="status">
          {uploading > 0 ? `Uploading ${uploading} ${uploading === 1 ? 'photo' : 'photos'}…` : photos.length > 0 ? `${photos.length} added` : ''}
        </p>
        {uploadError && <p className="field__error">{uploadError}</p>}
        {photos.length > 0 && (
          <ul role="list" className={styles.uploadGrid}>
            {photos.map((photo, i) => {
              const preview = previews[photo.id]
              return (
                <li key={photo.id} className={styles.uploadCell}>
                  {preview ? (
                    <Image src={preview} alt={`Photo ${i + 1}`} fill unoptimized sizes="10rem" className={styles.photoImage} />
                  ) : (
                    <MarketImage id={photo.id} base={photoBase} alt={`Photo ${i + 1}`} fill sizes="10rem" className={styles.photoImage} />
                  )}
                  <button
                    type="button"
                    className={styles.uploadRemove}
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => setPhotos((current) => current.filter((p) => p.id !== photo.id))}
                  >
                    <X aria-hidden="true" strokeWidth={2} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className={formStyles.row}>
        <Field name="sellerName" label={labels.sellerName} error={errors.sellerName}>
          {(control) => <input {...control} className="input" type="text" required autoComplete="name" maxLength={100} defaultValue={values.sellerName} />}
        </Field>
        <Field name="sellerRole" label={labels.sellerRole}>
          {(control) => (
            <select {...control} className="select" defaultValue={values.sellerRole ?? 'owner'}>
              {SELLER_ROLES.map((value) => (
                <option key={value} value={value}>
                  {sellerRoleLabels[value]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className={formStyles.row}>
        <Field name="sellerPhone" label={labels.sellerPhone} hint="Not shown publicly. Our team uses it to verify the property." error={errors.sellerPhone}>
          {(control) => <input {...control} className="input" type="tel" inputMode="tel" required autoComplete="tel" maxLength={20} placeholder="98290 12345" defaultValue={values.sellerPhone} />}
        </Field>
        <Field name="sellerEmail" label={labels.sellerEmail} hint="Not shown publicly. We send the confirmation link and updates here." error={errors.sellerEmail}>
          {(control) => <input {...control} className="input" type="email" inputMode="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} defaultValue={values.sellerEmail} />}
        </Field>
      </div>

      <div className="field">
        {errors.consent && (
          <p id="field-consent-error" className="field__error">
            {errors.consent}
          </p>
        )}
        <label className="choice" htmlFor="field-consent">
          <input id="field-consent" name="consent" type="checkbox" required defaultChecked={values.consent === 'on'} {...(errors.consent ? { 'aria-invalid': true, 'aria-describedby': 'field-consent-error' } : {})} />
          <span>I have the right to list this property, the details are true, and the team may contact me about it.</span>
        </label>
        <p className="field__hint">
          See the <Link href={routes.terms}>terms</Link> and <Link href={routes.privacy}>privacy notice</Link>.
        </p>
      </div>

      <Honeypot />

      <div className={formStyles.submit}>
        <button type="submit" className="button" disabled={pending || uploading > 0} aria-disabled={pending || uploading > 0}>
          <Send aria-hidden="true" strokeWidth={1.75} />
          {pending ? 'Sending…' : 'Submit for review'}
        </button>
        <p className={formStyles.privacy} aria-live="polite">
          {pending ? 'Sending your listing…' : 'Nothing is published until our team approves it.'}
        </p>
      </div>
    </form>
  )
}
