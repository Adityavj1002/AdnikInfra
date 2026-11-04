'use client'

import { ArrowDown, ArrowUp, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, type ChangeEvent } from 'react'
import { requestUploadTicket } from '@/features/marketplace/actions'
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from '@/features/marketplace/constants'
import { MarketImage } from '@/features/marketplace/MarketImage'
import { dimensions } from '@/features/marketplace/photo-size'
import styles from '@/features/admin/admin.module.css'

export type ManagedPhoto = Readonly<{ ref: string; alt: string; width: number; height: number; preview?: string }>

type Props = Readonly<{ initial: readonly ManagedPhoto[]; photoBase: string; limit: number }>

/**
 * The project's photos in display order. The first is the cover (cards, home page, share image).
 * New photos go straight to the photo host; the list travels to the server as one hidden field.
 */
export function PhotoManager({ initial, photoBase, limit }: Props) {
  const [photos, setPhotos] = useState<readonly ManagedPhoto[]>(initial)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const update = (index: number, change: Partial<ManagedPhoto>) =>
    setPhotos((current) => current.map((photo, i) => (i === index ? { ...photo, ...change } : photo)))
  const move = (index: number, step: number) =>
    setPhotos((current) => {
      const next = [...current]
      const [photo] = next.splice(index, 1)
      if (photo) next.splice(index + step, 0, photo)
      return next
    })

  async function add(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    setError('')
    const room = limit - photos.length - uploading
    if (files.length > room) setError(`A project can have up to ${limit} photos.`)
    for (const file of files.slice(0, Math.max(0, room))) {
      const heic = file.type === '' && /\.hei[cf]$/i.test(file.name)
      if (!heic && !(PHOTO_TYPES as readonly string[]).includes(file.type)) {
        setError(`${file.name}: please use a JPG, PNG, WebP or HEIC photo.`)
        continue
      }
      if (file.size > PHOTO_MAX_BYTES) {
        setError(`${file.name} is larger than 10 MB. Please choose a smaller photo.`)
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
        const alt = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim()
        setPhotos((current) => [...current, { ref: `upload:${result.public_id}`, alt: alt.length >= 3 ? alt : 'Project photo', ...size, preview: URL.createObjectURL(file) }])
      } catch {
        setError(`${file.name} did not upload. Please check your connection and try again.`)
      } finally {
        setUploading((count) => count - 1)
      }
    }
  }

  const payload = JSON.stringify(photos.map(({ ref, alt, width, height }) => ({ ref, alt, width, height })))

  return (
    <fieldset className={styles.photoField}>
      <legend className="visually-hidden">Photos</legend>
      <p className="field__hint">The first photo is the cover. Describe each one for people who can’t see it, and for Google Images.</p>
      <input type="hidden" name="photos" value={payload} />
      <ol className={styles.photoList}>
        {photos.map((photo, i) => (
          <li key={photo.ref} className={styles.photoRow}>
            <span className={styles.photoThumb}>
              {photo.preview ? (
                // Bundled photos come with their asset URL; a fresh upload shows its local copy.
                <Image src={photo.preview} alt="" fill unoptimized={photo.preview.startsWith('blob:')} sizes="8rem" />
              ) : (
                <MarketImage id={photo.ref.slice('upload:'.length)} base={photoBase} alt="" fill sizes="8rem" />
              )}
              {i === 0 && <span className={`badge badge--gold ${styles.coverBadge}`}>Cover</span>}
            </span>
            <span className={styles.photoAlt}>
              <label className="visually-hidden" htmlFor={`photo-alt-${i}`}>
                Description of photo {i + 1}
              </label>
              <input
                id={`photo-alt-${i}`}
                className="input"
                type="text"
                value={photo.alt}
                minLength={3}
                maxLength={200}
                required
                onChange={(event) => update(i, { alt: event.target.value })}
              />
            </span>
            <span className={styles.photoActions}>
              <button type="button" className="button button--outline button--small" aria-label={`Move photo ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp aria-hidden="true" strokeWidth={1.75} />
              </button>
              <button type="button" className="button button--outline button--small" aria-label={`Move photo ${i + 1} down`} disabled={i === photos.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown aria-hidden="true" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className={`button button--outline button--small ${styles.danger}`}
                aria-label={`Remove photo ${i + 1}`}
                disabled={photos.length === 1}
                onClick={() => setPhotos((current) => current.filter((_, j) => j !== i))}
              >
                <Trash2 aria-hidden="true" strokeWidth={1.75} />
              </button>
            </span>
          </li>
        ))}
      </ol>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="visually-hidden" tabIndex={-1} aria-label="Choose project photos" onChange={add} />
      <div className={styles.photoFoot}>
        <button type="button" className="button button--outline" disabled={photos.length + uploading >= limit} onClick={() => input.current?.click()}>
          <Upload aria-hidden="true" strokeWidth={1.75} />
          Add photos
        </button>
        <p className="field__hint" role="status">
          {uploading > 0 ? `Uploading ${uploading} ${uploading === 1 ? 'photo' : 'photos'}…` : `${photos.length} of ${limit} photos. Changes go live when you save.`}
        </p>
      </div>
      {error && <p className="field__error">{error}</p>}
    </fieldset>
  )
}
