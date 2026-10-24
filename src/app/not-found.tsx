import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { routes } from '@/lib/routes'
import styles from './status.module.css'

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } }

const suggestions = [
  { href: routes.projects, label: 'Our projects' },
  { href: routes.properties, label: 'Real estate for sale' },
  { href: routes.construction, label: 'Build on your plot' },
  { href: routes.contact, label: 'Contact us' },
] as const

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="Error 404"
        title="We couldn’t find that page"
        lead={<p>It may have moved, or the link may be mistyped. These will get you back on track:</p>}
      />
      <div className="container">
        <ul role="list" className={styles.links}>
          {suggestions.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.link}>
                {item.label}
                <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
