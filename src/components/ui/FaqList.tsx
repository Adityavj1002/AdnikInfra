import { Plus } from 'lucide-react'
import type { Faq } from '@/content/types'
import styles from './FaqList.module.css'

/** Native <details> disclosure: keyboard and screen-reader friendly with zero JavaScript. */
export function FaqList({ faqs }: Readonly<{ faqs: readonly Faq[] }>) {
  return (
    <div className={styles.list}>
      {faqs.map((faq, i) => (
        <details key={faq.question} className={styles.item}>
          <summary className={styles.question}>
            <span className={styles.number} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={styles.text}>{faq.question}</span>
            <span className={styles.marker} aria-hidden="true">
              <Plus strokeWidth={2} />
            </span>
          </summary>
          <p className={styles.answer}>{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
