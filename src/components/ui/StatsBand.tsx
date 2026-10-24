import type { Stat } from '@/content/types'
import styles from './StatsBand.module.css'

export function StatsBand({ stats, label }: Readonly<{ stats: readonly Stat[]; label: string }>) {
  if (stats.length === 0) return null
  return (
    <dl className={styles.stats} aria-label={label}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}
