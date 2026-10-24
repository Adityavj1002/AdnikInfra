import Link from 'next/link'
import { Logo } from './Logo'
import { SiteNav } from './SiteNav'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand}>
          <Logo />
        </Link>
        <SiteNav />
      </div>
    </header>
  )
}
