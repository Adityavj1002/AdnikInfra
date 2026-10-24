import { Plus } from 'lucide-react'
import type { Faq } from '@/content/types'
import styles from './FaqList.module.css'

/** Native <details> disclosure: keyboard and screen-reader friendly with zero JavaScript. */
export function FaqList({ faqs }: Readonly<{ faqs: readonly Faq[] }>) {
  return (
    <div className={styles.list}>
      {faqs.map((faq) => (
        <details key={faq.question} className={styles.item}>
          <summary className={styles.question}>
            <span>{faq.question}</span>
            <Plus aria-hidden="true" className={styles.marker} strokeWidth={2} />
          </summary>
          <p className={styles.answer}>{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
