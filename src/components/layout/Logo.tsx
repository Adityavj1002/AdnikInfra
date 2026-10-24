import { site } from '@/config/site'
import styles from './Logo.module.css'

/** Wordmark with a simple roofline mark. Replace with the client's logo file when available. */
export function Logo({ inverse = false }: Readonly<{ inverse?: boolean }>) {
  return (
    <span className={`${styles.logo} ${inverse ? styles.inverse : ''}`}>
      <svg viewBox="0 0 40 40" className={styles.mark} aria-hidden="true">
        <rect width="40" height="40" rx="10" className={styles.tile} />
        <path d="M9 21 20 11l11 10" className={styles.roof} />
        <path d="M13 19v11h14V19" className={styles.walls} />
        <path d="M18 30v-6h4v6" className={styles.door} />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>{site.name}</span>
        <span className={styles.tag}>{site.descriptor}</span>
      </span>
    </span>
  )
}
