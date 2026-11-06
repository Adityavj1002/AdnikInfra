import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/config/site'
import { formatPhone } from '@/lib/format'
import { services } from '@/content/services'
import { ListingAlerts } from '@/features/alerts/ListingAlerts'
import { routes } from '@/lib/routes'
import { FooterScene } from './FooterScene'
import { Logo } from './Logo'
import styles from './SiteFooter.module.css'

const NETWORKS: Readonly<Record<string, string>> = {
  'instagram.com': 'Instagram',
  'facebook.com': 'Facebook',
  'youtube.com': 'YouTube',
  'linkedin.com': 'LinkedIn',
  'x.com': 'X',
}

/** "https://www.instagram.com/adnik_infra" → Instagram, adnik_infra. */
function profileOf(url: string): Readonly<{ network: string; handle?: string }> {
  const { hostname, pathname } = new URL(url)
  const host = hostname.replace(/^www\./, '')
  const handle = pathname.split('/').find(Boolean)
  return { network: NETWORKS[host] ?? host.split('.')[0] ?? host, ...(handle ? { handle } : {}) }
}

/** Instagram's glyph in its brand gradient, drawn inline (no third-party request). */
function InstagramMark() {
  return (
    <svg className={styles.socialMark} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="ig-gradient" cx="0.3" cy="1.07" r="1.2">
          <stop offset="0" stopColor="#fdd56e" />
          <stop offset="0.25" stopColor="#fd8a3b" />
          <stop offset="0.55" stopColor="#e1306c" />
          <stop offset="0.8" stopColor="#c13584" />
          <stop offset="1" stopColor="#5b51d8" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#ig-gradient)" />
      <rect x="7" y="7" width="18" height="18" rx="5.5" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="16" cy="16" r="4.3" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="21.6" cy="10.4" r="1.4" fill="#fff" />
    </svg>
  )
}

type FooterLink = Readonly<{ href: string; label: string }>

const sectorLinks: readonly FooterLink[] = [
  { href: routes.sector('infrastructure'), label: 'Infrastructure' },
  { href: routes.sector('industrial'), label: 'Industrial' },
  { href: routes.sector('mining'), label: 'Mining' },
]

// Careers joins this list once the careers page exists.
const companyLinks: readonly FooterLink[] = [
  { href: routes.projects, label: 'Projects' },
  { href: routes.about, label: 'About us' },
  { href: routes.contact, label: 'Contact' },
]

// Real estate, locations and guides left the main menu but must stay linked for visitors and crawlers.
const exploreLinks: readonly FooterLink[] = [
  { href: routes.marketplace, label: 'Marketplace' },
  { href: routes.marketplaceSell, label: 'List your property' },
  { href: routes.construction, label: 'Home construction' },
  { href: routes.warehouse, label: 'Warehouse construction' },
  { href: routes.locations, label: 'Locations' },
  { href: routes.blog, label: 'Guides & blog' },
  { href: routes.faq, label: 'FAQs' },
]

const legalLinks: readonly FooterLink[] = [
  { href: routes.privacy, label: 'Privacy policy' },
  { href: routes.terms, label: 'Terms of use' },
  { href: routes.disclaimer, label: 'Disclaimer' },
  { href: routes.accessibility, label: 'Accessibility' },
]

/** Navy footer: pitch and sign-up beside isometric miniatures, then link columns, then the fine print. */
export function SiteFooter() {
  const { email, phone, whatsapp, hours } = site.contact
  const address = site.business.address
  const profiles = site.business.profiles

  const columns = [
    { title: 'Services', links: services.map((service) => ({ href: service.href, label: service.title })) },
    { title: 'Sectors', links: sectorLinks },
    { title: 'Company', links: companyLinks },
    { title: 'Explore', links: exploreLinks },
  ] as const

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.feature}`}>
        <div className={styles.pitch}>
          <p className={styles.pitchEyebrow}>Jaipur &amp; nearby towns</p>
          <p className={styles.pitchTitle}>
            Find, build or sell your property with <span className={styles.pitchAccent}>one trusted team</span>.
          </p>
          <ListingAlerts />
        </div>
        <FooterScene className={styles.scene} />
      </div>

      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Logo size="lg" />
          <p className={styles.about}>
            Adnik Infra advises on construction, environmental clearance, project management, real estate and
            infrastructure development, so your project is planned right, approved on time and built to last.
          </p>
          <ul role="list" className={styles.contact}>
            {phone && (
              <li>
                <Phone aria-hidden="true" className="icon" strokeWidth={1.75} />
                <a href={`tel:${phone}`}>{formatPhone(phone)}</a>
              </li>
            )}
            {whatsapp && (
              <li>
                <MessageCircle aria-hidden="true" className="icon" strokeWidth={1.75} />
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp us
                </a>
              </li>
            )}
            {email && (
              <li>
                <Mail aria-hidden="true" className="icon" strokeWidth={1.75} />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            {address && (
              <li>
                <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} />
                <span>
                  {address.streetAddress}, {address.addressLocality} {address.postalCode}
                </span>
              </li>
            )}
            <li>
              <Clock aria-hidden="true" className="icon" strokeWidth={1.75} />
              <span>{hours}</span>
            </li>
          </ul>
          {profiles.length > 0 && (
            <ul role="list" className={styles.social} aria-label="Adnik Infra on social media">
              {profiles.map((url) => {
                const { network, handle } = profileOf(url)
                return (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer me" className={styles.socialLink}>
                      {network === 'Instagram' ? <InstagramMark /> : null}
                      <span className={styles.socialText}>
                        <span className={styles.socialNetwork}>{network}</span>
                        {handle && <span className={styles.socialHandle}>@{handle}</span>}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className={styles.columns}>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className={styles.columnTitle}>{column.title}</h2>
              <ul role="list" className="list-plain">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} {site.name}. All rights reserved. Powered by{' '}
          {/* Agency credit. New tab, and no noreferrer so Naigrowth still sees the referral. */}
          <a className={styles.credit} href="https://naigrowth.com" target="_blank" rel="noopener">
            <Image src="/brand/naigrowth-logo.png" alt="" width={22} height={22} className={styles.creditLogo} />
            Naigrowth
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </p>
        <ul role="list" className={styles.legal}>
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
