import type { LucideIcon } from 'lucide-react'
import styles from './KeyFacts.module.css'

export type Fact = Readonly<{ label: string; value: string; icon?: LucideIcon }>

/** Compact grid of labelled facts (price, size, possession…). A real <dl> for assistive tech. */
export function KeyFacts({ facts, label, columns }: Readonly<{ facts: readonly Fact[]; label: string; columns?: 2 | 3 | 4 }>) {
  return (
    <dl className={`${styles.facts} ${columns ? styles[`cols${columns}`] : ''}`} aria-label={label}>
      {facts.map(({ label: term, value, icon: Icon }) => (
        <div key={term} className={styles.fact}>
          {Icon && (
            <span className={styles.icon} aria-hidden="true">
              <Icon strokeWidth={1.75} />
            </span>
          )}
          <dt className={styles.term}>{term}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
