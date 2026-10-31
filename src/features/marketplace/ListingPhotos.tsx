'use client'

import { useState } from 'react'
import type { ListingPhoto } from './constants'
import { MarketImage } from './MarketImage'
import styles from './marketplace.module.css'

/** One large photo with a row of thumbnails that swap it. */
export function ListingPhotos({ photos, base, title }: Readonly<{ photos: readonly ListingPhoto[]; base: string; title: string }>) {
  const [index, setIndex] = useState(0)
  const current = photos[index] ?? photos[0]
  if (!current) return null
  return (
    <div className={styles.photos}>
      <div className={styles.photoMain}>
        <MarketImage
          id={current.id}
          base={base}
          alt={`${title}, photo ${index + 1} of ${photos.length}`}
          fill
          sizes="(min-width: 60rem) 60vw, 100vw"
          loading="eager"
          fetchPriority="high"
          className={styles.photoImage}
        />
      </div>
      {photos.length > 1 && (
        <ul role="list" className={styles.thumbs}>
          {photos.map((photo, i) => (
            <li key={photo.id}>
              <button
                type="button"
                className={styles.thumb}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                <MarketImage id={photo.id} base={base} alt="" fill sizes="6rem" className={styles.photoImage} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
