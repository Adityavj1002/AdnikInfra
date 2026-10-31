import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { logout } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { routes } from '@/lib/routes'

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

const links = [
  { href: routes.admin, label: 'Overview' },
  { href: routes.adminListings, label: 'Listings' },
  { href: routes.adminSubscribers, label: 'Subscribers' },
  { href: routes.adminCampaigns, label: 'Campaigns' },
  { href: routes.adminTeam, label: 'Team' },
  { href: routes.adminAccount, label: 'My account' },
] as const

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const admin = await requireAdmin()
  return (
    <div className={`container ${styles.shell}`}>
      <div className={styles.bar}>
        <nav aria-label="Admin">
          <ul role="list" className={styles.nav}>
            {/* Every prefetch of a panel page would run the session check and its queries. */}
            {links.map((link) => (
              <li key={link.href}>
                <Link prefetch={false} href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.who}>
          <span>{admin.name}</span>
          <form action={logout}>
            <button type="submit" className="button button--outline button--small">Sign out</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  )
}
