import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'
import styles from './TileGrid.module.css'

export type Tile = Readonly<{
  href: string
  icon: ComponentType<{ strokeWidth?: number }>
  title: string
  body?: string
  cta: string
  /** Shown in the corner; defaults to the tile's position, 01, 02… */
  number?: string
  highlight?: boolean
}>

/** A grid of square link cards. Five tiles sit three above two. */
export function TileGrid({ tiles }: Readonly<{ tiles: readonly Tile[] }>) {
  return (
    <ul role="list" className={styles.grid}>
      {tiles.map(({ href, icon: Icon, title, body, cta, number, highlight }, i) => (
        <li key={title} className="reveal">
          <Link href={href} className={`${styles.tile} ${highlight ? styles.tileHighlight : ''}`}>
            <div className={styles.top}>
              <span className={styles.icon} aria-hidden="true">
                <Icon strokeWidth={1.5} />
              </span>
              <span className={styles.number}>{number ?? String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{title}</h3>
              {body && <p className={styles.body}>{body}</p>}
            </div>
            <div className={styles.footer}>
              <span className={styles.cta}>{cta}</span>
              <span className={styles.arrow} aria-hidden="true">
                <ArrowUpRight strokeWidth={2} />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
