import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Img } from '@/content/types'
import styles from './PageHero.module.css'

type Props = Readonly<{
  eyebrow?: string
  /** The page's single H1: carries the route's primary keyword. */
  title: ReactNode
  lead?: ReactNode
  image?: Img
  children?: ReactNode
}>

/** Inner-page header. With an image it becomes a photo banner; without, a clean text header. */
export function PageHero({ eyebrow, title, lead, image, children }: Props) {
  if (image) {
    return (
      <header className={styles.photo}>
        <Image src={image.src} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" placeholder="blur" className={styles.bg} />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={`container ${styles.photoInner}`}>
          {eyebrow && <p className={`eyebrow ${styles.photoEyebrow}`}>{eyebrow}</p>}
          <h1 className={styles.photoTitle}>{title}</h1>
          {lead && <div className={styles.photoLead}>{lead}</div>}
          {children && <div className={styles.actions}>{children}</div>}
        </div>
      </header>
    )
  }

  return (
    <header className={`container ${styles.plain}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {lead && <div className={styles.lead}>{lead}</div>}
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  )
}
