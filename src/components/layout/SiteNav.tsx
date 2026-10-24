'use client'

import { ArrowRight, CalendarCheck, Menu, Phone, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { site } from '@/config/site'
import { contactHref, routes } from '@/lib/routes'
import { Logo } from './Logo'
import styles from './SiteNav.module.css'

const items = [
  { href: routes.projects, label: 'Projects', note: 'Villas, apartments and plots' },
  { href: routes.properties, label: 'Real Estate', note: 'Ready and resale homes' },
  { href: routes.construction, label: 'Construction', note: 'Build on your own plot' },
  { href: routes.locations, label: 'Locations', note: 'Jaipur and nearby towns' },
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
        <Link href={contactHref('site-visit')} className={`button button--small ${styles.visit}`}>
          <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
          Book a site visit
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
        <ul role="list" className={styles.sheetList}>
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
          <Link href={contactHref('site-visit')} className="button button--gold button--block">
            <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
            Book a site visit
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
