import type { LucideIcon } from 'lucide-react'
import styles from './KeyFacts.module.css'

export type Fact = Readonly<{ label: string; value: string; icon?: LucideIcon }>

/** One panel of labelled facts (size, possession…) split by hairlines. A real <dl> for assistive tech. */
export function KeyFacts({ facts, label }: Readonly<{ facts: readonly Fact[]; label: string }>) {
  return (
    <dl className={styles.facts} aria-label={label}>
      {facts.map(({ label: term, value, icon: Icon }) => (
        <div key={term} className={`${styles.fact} ${Icon ? styles.lead : ''}`}>
          <dt className={styles.term}>
            {Icon && <Icon aria-hidden="true" className={styles.icon} strokeWidth={1.75} />}
            {term}
          </dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
