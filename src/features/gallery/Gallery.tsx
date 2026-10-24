'use client'

import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Img } from '@/content/types'
import styles from './Gallery.module.css'

/**
 * Photo grid + full-screen lightbox on the native <dialog>: focus is trapped and Esc closes
 * for free. Arrow keys and horizontal swipes move between photos.
 */
export function Gallery({ images, title }: Readonly<{ images: readonly Img[]; title: string }>) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(0)
  const swipeStart = useRef<number | null>(null)
  const count = images.length

  const open = (at: number) => {
    setIndex(at)
    dialog.current?.showModal()
  }
  const go = useCallback((step: number) => setIndex((current) => (current + step + count) % count), [count])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    element.addEventListener('keydown', onKey)
    return () => element.removeEventListener('keydown', onKey)
  }, [go])

  if (count === 0) return null
  const current = images[index] ?? images[0]!
  const preview = images.slice(0, 5)

  return (
    <div className={styles.gallery}>
      <ul role="list" className={`${styles.grid} ${styles[`count${Math.min(preview.length, 5)}`] ?? ''}`}>
        {preview.map((image, i) => (
          <li key={image.src.src} className={styles.cell}>
            <button type="button" className={styles.thumb} onClick={() => open(i)} aria-label={`Open photo ${i + 1} of ${count}: ${image.alt}`}>
              <Image
                src={image.src}
                alt=""
                fill
                placeholder="blur"
                sizes={i === 0 ? '(min-width: 60rem) 60vw, 100vw' : '(min-width: 60rem) 20vw, 50vw'}
                className={styles.image}
                {...(i === 0 ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
              />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={`button button--outline button--small ${styles.all}`} onClick={() => open(0)}>
        <Images aria-hidden="true" strokeWidth={1.75} />
        {count === 1 ? 'View photo' : `View all ${count} photos`}
      </button>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={`${title} photos`}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
        onPointerDown={(event) => {
          swipeStart.current = event.clientX
        }}
        onPointerUp={(event) => {
          if (swipeStart.current === null) return
          const delta = event.clientX - swipeStart.current
          swipeStart.current = null
          if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1)
        }}
      >
        <div className={styles.stage}>
          <Image src={current.src} alt={current.alt} placeholder="blur" sizes="100vw" className={styles.full} />
          <p className={styles.caption} aria-live="polite">
            <span className="nums">
              {index + 1} / {count}
            </span>{' '}
            {current.alt}
          </p>
        </div>
        <button type="button" className={`${styles.control} ${styles.close}`} onClick={() => dialog.current?.close()} aria-label="Close photos">
          <X aria-hidden="true" strokeWidth={2} />
        </button>
        {count > 1 && (
          <>
            <button type="button" className={`${styles.control} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronLeft aria-hidden="true" strokeWidth={2} />
            </button>
            <button type="button" className={`${styles.control} ${styles.next}`} onClick={() => go(1)} aria-label="Next photo">
              <ChevronRight aria-hidden="true" strokeWidth={2} />
            </button>
          </>
        )}
      </dialog>
    </div>
  )
}
