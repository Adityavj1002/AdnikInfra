import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

type Props = Readonly<{
  id: string
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  action?: ReactNode
  align?: 'start' | 'center'
  as?: 'h2' | 'h3'
}>

export function SectionHeading({ id, eyebrow, title, intro, action, align = 'start', as: Heading = 'h2' }: Props) {
  return (
    <header className={`${styles.head} ${align === 'center' ? styles.center : ''}`}>
      <div className={styles.text}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading id={id} className={styles.title}>
          {title}
        </Heading>
        {intro && <div className={styles.intro}>{intro}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  )
}
