'use client'

import { useEffect, useRef, useState } from 'react'
import type { Film } from '@/content/types'
import styles from './LazyVideo.module.css'

type NetworkInformation = Readonly<{ saveData?: boolean }>

function prefersLite(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  return Boolean(connection?.saveData) || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Lazy cinematic video (§9, §10.4). Sources attach only near the viewport, playback pauses
 * offscreen, and Save-Data / reduced-motion visitors get the poster until they press play.
 * Captions and a full transcript are always in the HTML for people and crawlers alike.
 */
export function LazyVideo({ film, className }: Readonly<{ film: Film; className?: string }>) {
  const video = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)

  useEffect(() => {
    const element = video.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) setNear(true)
        const visible = entry.intersectionRatio > 0.35
        if (visible && !userPaused.current && !prefersLite()) {
          element.play().then(() => setPlaying(true), () => setPlaying(false))
        } else if (!visible && !element.paused) {
          element.pause()
          setPlaying(false)
        }
      },
      { rootMargin: '200px 0px', threshold: [0, 0.35] },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    const element = video.current
    if (!element) return
    if (element.paused) {
      userPaused.current = false
      setNear(true)
      element.play().then(() => setPlaying(true), () => setPlaying(false))
    } else {
      userPaused.current = true
      element.pause()
      setPlaying(false)
    }
  }

  return (
    <figure className={`${styles.figure} ${className ?? ''}`}>
      <div className={styles.frame}>
        <video
          ref={video}
          className={styles.video}
          poster={film.poster}
          preload="none"
          muted
          loop
          playsInline
          aria-label={film.title}
        >
          {near && film.sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
          {film.captions && (
            <track
              kind="captions"
              src={film.captions.src}
              srcLang={film.captions.srclang}
              label={film.captions.label}
              default
            />
          )}
        </video>
        <button type="button" className={styles.toggle} onClick={toggle} aria-pressed={!playing}>
          {playing ? 'Pause film' : 'Play film'}
        </button>
      </div>
      <figcaption className={styles.caption}>
        <span>{film.title}</span>
        <details className={styles.transcript}>
          <summary>Read the film transcript</summary>
          {film.transcript.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </details>
      </figcaption>
    </figure>
  )
}
