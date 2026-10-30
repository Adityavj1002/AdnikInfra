import { CalendarCheck, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { site } from '@/config/site'
import styles from './MobileActionBar.module.css'

/**
 * Thumb-reachable actions pinned to the bottom of the screen on phones (hidden on larger
 * screens, where the same actions sit in the page). Clears the iOS home indicator.
 * data-action-bar lets the footer pad itself so the bar never covers its last links.
 */
export function MobileActionBar({ enquireHref, label }: Readonly<{ enquireHref: string; label: string }>) {
  const { phone, whatsapp } = site.contact
  return (
    <div className={styles.bar} role="region" aria-label="Quick actions" data-action-bar>
      {phone && (
        <a href={`tel:${phone}`} className={`button button--outline ${styles.icon}`} aria-label="Call">
          <Phone aria-hidden="true" strokeWidth={1.75} />
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          className={`button button--outline ${styles.icon}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <MessageCircle aria-hidden="true" strokeWidth={1.75} />
        </a>
      )}
      <Link href={enquireHref} className={`button button--gold ${styles.primary}`}>
        <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
        {label}
      </Link>
    </div>
  )
}
