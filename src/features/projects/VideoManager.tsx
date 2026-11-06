'use client'

import { Trash2, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { requestVideoTicket } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'

export type ManagedVideo = Readonly<{ video: string; portrait: boolean; seconds: number; poster?: string; uploadDate?: string }>

type Props = Readonly<{ initial?: ManagedVideo; videoBase?: string }>

const VIDEO_MAX_BYTES = 100 * 1024 * 1024

/**
 * One project video, uploaded straight from the browser to Cloudinary with a signed ticket.
 * The page shows it in a 9:16 frame when it was shot upright.
 */
export function VideoManager({ initial, videoBase }: Props) {
  const [video, setVideo] = useState<ManagedVideo | undefined>(initial)
  const [progress, setProgress] = useState<number | undefined>()
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  function upload(file: File) {
    setError('')
    if (!/^video\//.test(file.type)) return setError(`${file.name}: please choose an MP4, MOV or WebM video.`)
    if (file.size > VIDEO_MAX_BYTES) return setError(`${file.name} is larger than 100 MB. Please choose a shorter or smaller video.`)
    setProgress(0)
    requestVideoTicket()
      .then((ticket) => {
        if (!ticket.ok) throw new Error(ticket.reason)
        const body = new FormData()
        for (const [key, value] of Object.entries(ticket.fields)) body.set(key, value)
        body.set('file', file)
        // XHR rather than fetch: a large video needs a progress bar.
        return new Promise<ManagedVideo>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', ticket.url)
          xhr.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round((event.loaded / event.total) * 100))
          xhr.onerror = () => reject(new Error('network'))
          xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300) return reject(new Error(String(xhr.status)))
            const result = JSON.parse(xhr.responseText) as { public_id: string; duration?: number; width?: number; height?: number }
            resolve({
              video: result.public_id,
              portrait: (result.height ?? 0) > (result.width ?? 0),
              seconds: Math.max(1, Math.round(result.duration ?? 1)),
              uploadDate: new Date().toISOString().slice(0, 10),
            })
          }
          xhr.send(body)
        })
      })
      .then(setVideo)
      .catch((reason: unknown) =>
        setError(
          String(reason).includes('unavailable')
            ? 'Video uploads need Cloudinary to be set up on the server.'
            : `${file.name} did not upload. Please check your connection and try again.`,
        ),
      )
      .finally(() => setProgress(undefined))
  }

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) upload(file)
  }

  return (
    <fieldset className={styles.photoField}>
      <legend className="visually-hidden">Video</legend>
      <input type="hidden" name="film" value={video ? JSON.stringify(video) : ''} />
      {video && videoBase && (
        <video
          className={video.portrait ? styles.videoPortrait : styles.videoPreview}
          src={`${videoBase}/q_auto/${video.video}.mp4`}
          controls
          muted
          playsInline
          preload="metadata"
        />
      )}
      <input ref={input} type="file" accept="video/mp4,video/quicktime,video/webm" className="visually-hidden" tabIndex={-1} aria-label="Choose a video" onChange={choose} />
      <div className={styles.photoFoot}>
        <button type="button" className="button button--outline" disabled={progress !== undefined} onClick={() => input.current?.click()}>
          <Upload aria-hidden="true" strokeWidth={1.75} />
          {video ? 'Replace video' : 'Add a video'}
        </button>
        {video && (
          <button type="button" className={`button button--outline ${styles.danger}`} onClick={() => setVideo(undefined)}>
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
            Remove video
          </button>
        )}
        <p className="field__hint" role="status">
          {progress !== undefined
            ? `Uploading… ${progress}%`
            : video
              ? `${video.seconds} seconds, ${video.portrait ? 'upright' : 'landscape'}. Changes go live when you save.`
              : 'Optional. MP4, MOV or WebM, up to 100 MB.'}
        </p>
      </div>
      {error && <p className="field__error">{error}</p>}
    </fieldset>
  )
}
