import { ArrowRight, CalendarCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/config/site'
import { photos } from '@/content/images'
import styles from './CtaBand.module.css'

type Action = Readonly<{ href: string; label: string }>

/** Closing call to action over a dark photo. */
export function CtaBand({
  id,
  title,
  body,
  primary,
  secondary,
}: Readonly<{ id: string; title: string; body: string; primary: Action; secondary?: Action }>) {
  return (
    <section className={styles.band} aria-labelledby={id}>
      <Image src={photos.handoverKeys.src} alt="" fill sizes="100vw" placeholder="blur" className={styles.bg} />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        <p className={styles.body}>{body}</p>
        <div className={styles.actions}>
          <Link href={primary.href} className="button button--gold">
            <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="button button--light">
              {secondary.label}
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </Link>
          )}
        </div>
        <p className={styles.note}>{site.contact.responseTime}</p>
      </div>
    </section>
  )
}
