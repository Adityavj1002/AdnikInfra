import Image from 'next/image'
import { site } from '@/config/site'
import styles from './Logo.module.css'

export function Logo({ inverse = false }: Readonly<{ inverse?: boolean }>) {
  return (
    <span className={`${styles.logo} ${inverse ? styles.inverse : ''}`}>
      <Image
        src="/icon.png"
        alt={`${site.name} logo`}
        width={42}
        height={42}
        className={styles.markImage}
        priority
      />
      <span className={styles.text}>
        <span className={styles.name}>{site.name}</span>
        <span className={styles.tag}>{site.descriptor}</span>
      </span>
    </span>
  )
}
