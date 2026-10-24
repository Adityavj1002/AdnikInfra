import { site } from '@/config/site'
import { LogoMark } from './LogoMark'
import styles from './Logo.module.css'

/**
 * Mark + wordmark lockup. The wordmark is live text (uppercased in CSS), so screen readers
 * hear "Adnik Infra", not letters, and the link's accessible name is the brand.
 */
export function Logo({ size = 'md' }: Readonly<{ size?: 'md' | 'lg' }>) {
  const [first = site.name, ...rest] = site.name.split(' ')

  return (
    <span className={`${styles.logo} ${size === 'lg' ? styles.lg : ''}`}>
      <LogoMark className={styles.mark} />
      <span className={styles.text}>
        <span className={styles.name}>
          {first}
          {rest.length > 0 && (
            <>
              {' '}
              <span className={styles.accent}>{rest.join(' ')}</span>
            </>
          )}
        </span>
        <span className={styles.tag}>{site.tagline}</span>
      </span>
    </span>
  )
}
