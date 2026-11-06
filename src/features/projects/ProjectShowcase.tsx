'use client'

import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Pause, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Img } from '@/content/types'
import styles from './ProjectShowcase.module.css'

export type Slide = Readonly<{
  slug: string
  href: string
  name: string
  kind: string
  stage: string
  place?: string
  summary: string
  homes: readonly string[]
  image: Img
}>

/** How long each project stays on screen; the gold progress bar fills over the same time. */
const SLIDE_MS = 6500
/** A horizontal drag longer than this changes the slide instead of following the link. */
const SWIPE_PX = 48

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Every project as a full-width slide: crossfade with a slow zoom, a progress bar per project,
 * swipe on touch, arrows and a pause button. The whole slide links to the project's page.
 * Autoplay never starts for people who ask for reduced motion, and stops while hovered or focused.
 */
export function ProjectShowcase({ slides, title, allHref }: Readonly<{ slides: readonly Slide[]; title: string; allHref: string }>) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const [motion, setMotion] = useState(false)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const count = slides.length

  const go = useCallback((index: number) => setActive((index + count) % count), [count])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const update = () => setMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const playing = motion && !paused && !held && count > 1

  const onPointerDown = (event: React.PointerEvent) => {
    drag.current = { x: event.clientX, y: event.clientY }
    swiped.current = false
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const start = drag.current
    drag.current = null
    if (!start) return
    const dx = event.clientX - start.x
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
      swiped.current = true
      go(active + (dx < 0 ? 1 : -1))
    }
  }

  return (
    <section
      id="projects"
      className={styles.showcase}
      aria-roledescription="carousel"
      aria-labelledby="showcase-title"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(active + 1)
        if (event.key === 'ArrowLeft') go(active - 1)
      }}
    >
      <div className={`container ${styles.head}`}>
        <div className={styles.headText}>
          <p className={`eyebrow ${styles.eyebrow}`}>Our projects</p>
          <h2 id="showcase-title" className={styles.title}>
            {title}
          </h2>
        </div>
        <div className={styles.headSide}>
          <p className={styles.counter} aria-hidden="true">
            <span className={styles.counterNow}>{pad(active + 1)}</span>
            <span className={styles.counterAll}>/ {pad(count)}</span>
          </p>
          {count > 1 && (
            <div className={styles.controls}>
              <button type="button" className={styles.control} onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>
                {paused ? <Play aria-hidden="true" strokeWidth={1.75} /> : <Pause aria-hidden="true" strokeWidth={1.75} />}
              </button>
              <button type="button" className={styles.control} onClick={() => go(active - 1)} aria-label="Previous project">
                <ArrowLeft aria-hidden="true" strokeWidth={1.75} />
              </button>
              <button type="button" className={styles.control} onClick={() => go(active + 1)} aria-label="Next project">
                <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (drag.current = null)}>
        {slides.map((slide, i) => {
          const current = i === active
          return (
            <div
              key={slide.slug}
              className={`${styles.slide} ${current ? styles.current : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.name}`}
              aria-hidden={!current}
              inert={!current}
            >
              <Link
                href={slide.href}
                className={styles.link}
                draggable={false}
                onClick={(event) => {
                  if (swiped.current) event.preventDefault()
                }}
              >
                <div className={styles.media}>
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt}
                    fill
                    sizes="100vw"
                    placeholder="blur"
                    draggable={false}
                    className={styles.image}
                  />
                </div>
                <span className={styles.shade} aria-hidden="true" />
                <span className={styles.bigNumber} aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <div className={`container ${styles.copy}`}>
                  <p className={styles.badges}>
                    <span className={styles.stageBadge}>{slide.stage}</span>
                    <span className={styles.kind}>{slide.kind}</span>
                  </p>
                  <h3 className={styles.name}>{slide.name}</h3>
                  {slide.place && (
                    <p className={styles.place}>
                      <MapPin aria-hidden="true" strokeWidth={1.75} /> {slide.place}
                    </p>
                  )}
                  <p className={styles.summary}>{slide.summary}</p>
                  {slide.homes.length > 0 && (
                    <ul role="list" className={styles.homes}>
                      {slide.homes.map((home) => (
                        <li key={home} className={styles.home}>
                          {home}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className={styles.cta}>
                    View project <ArrowUpRight aria-hidden="true" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      <div className={`container ${styles.foot}`}>
        {count > 1 && (
          <div className={styles.tabs} role="group" aria-label="Choose a project">
            {slides.map((slide, i) => (
              <button
                key={slide.slug}
                type="button"
                className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <span className={styles.bar}>
                  <span
                    key={i === active ? `run-${active}` : 'idle'}
                    className={styles.fill}
                    style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                    onAnimationEnd={() => go(active + 1)}
                  />
                </span>
                <span className={styles.tabThumb}>
                  <Image src={slide.image.src} alt="" fill sizes="5rem" />
                </span>
                <span className={styles.tabText}>
                  <span className={styles.tabNumber} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span className={styles.tabName}>{slide.name}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        <Link href={allHref} className={styles.all}>
          View all projects <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  )
}
