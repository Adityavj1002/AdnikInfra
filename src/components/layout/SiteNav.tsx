'use client'

import { ArrowRight, Menu, Phone, Send, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { site } from '@/config/site'
import { contactHref, routes } from '@/lib/routes'
import { Logo } from './Logo'
import styles from './SiteNav.module.css'

const items = [
  { href: `${routes.home}#services`, label: 'Services', note: 'Five services, one team' },
  { href: `${routes.home}#sectors`, label: 'Sectors', note: 'Infrastructure, industrial and mining' },
  { href: routes.environmentalClearance, label: 'Environmental Clearance', note: 'Clearances and compliance' },
  { href: routes.projects, label: 'Projects', note: 'Selected work' },
  { href: routes.marketplace, label: 'Marketplace', note: 'Buy, or list your property' },
  { href: routes.about, label: 'About', note: 'Who we are' },
] as const

const MENU_ID = 'site-menu'

/**
 * Desktop: inline links. Mobile: a full-screen sheet on the native Popover API, which gives
 * focus handling, Esc and light-dismiss for free and works without React state.
 */
export function SiteNav() {
  const pathname = usePathname()
  const menu = useRef<HTMLDivElement>(null)
  const { phone } = site.contact

  // Close the sheet after client-side navigation.
  useEffect(() => {
    const element = menu.current
    if (element?.matches(':popover-open')) element.hidePopover()
  }, [pathname])

  // A link to a section of this page doesn't change the pathname, so the effect above can't fire.
  const closeMenu = () => {
    const element = menu.current
    if (element?.matches(':popover-open')) element.hidePopover()
  }

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const current = (href: string) => (isCurrent(href) ? { 'aria-current': 'page' as const } : {})

  return (
    <nav aria-label="Main" className={styles.nav}>
      <ul role="list" className={styles.inline}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.inlineLink} {...current(item.href)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        {phone ? (
          <a href={`tel:${phone}`} className={`button button--outline button--small ${styles.call}`}>
            <Phone aria-hidden="true" strokeWidth={1.75} />
            <span className={styles.callText}>Call us</span>
          </a>
        ) : (
          <Link href={routes.contact} className={`${styles.inlineLink} ${styles.contactLink}`} {...current(routes.contact)}>
            Contact
          </Link>
        )}
        <Link href={contactHref('proposal')} className={`button button--small ${styles.visit}`}>
          <Send aria-hidden="true" strokeWidth={1.75} />
          Request a proposal
        </Link>
        <button type="button" className={styles.menuButton} popoverTarget={MENU_ID} aria-label="Open menu">
          <Menu aria-hidden="true" strokeWidth={2} />
        </button>
      </div>

      <div id={MENU_ID} ref={menu} popover="auto" className={styles.sheet} aria-label="Menu">
        <div className={styles.sheetHead}>
          <Logo />
          <button type="button" className={styles.closeButton} popoverTarget={MENU_ID} popoverTargetAction="hide" aria-label="Close menu">
            <X aria-hidden="true" strokeWidth={2} />
          </button>
        </div>
        <ul role="list" className={styles.sheetList} onClick={closeMenu}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.sheetLink} {...current(item.href)}>
                <span>
                  <span className={styles.sheetLabel}>{item.label}</span>
                  <span className={styles.sheetNote}>{item.note}</span>
                </span>
                <ArrowRight aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
          <li>
            <Link href={routes.contact} className={styles.sheetLink} {...current(routes.contact)}>
              <span>
                <span className={styles.sheetLabel}>Contact</span>
                <span className={styles.sheetNote}>{site.contact.hours}</span>
              </span>
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </Link>
          </li>
        </ul>
        <div className={styles.sheetFoot}>
          <Link href={contactHref('proposal')} className="button button--gold button--block">
            <Send aria-hidden="true" strokeWidth={1.75} />
            Request a proposal
          </Link>
          {phone && (
            <a href={`tel:${phone}`} className="button button--outline button--block">
              <Phone aria-hidden="true" strokeWidth={1.75} />
              Call {phone}
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
