import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/config/site'
import { services } from '@/content/services'
import { ListingAlerts } from '@/features/alerts/ListingAlerts'
import { routes } from '@/lib/routes'
import { FooterScene } from './FooterScene'
import { Logo } from './Logo'
import styles from './SiteFooter.module.css'

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
  { href: routes.properties, label: 'Real estate' },
  { href: routes.construction, label: 'Home construction' },
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
                <a href={`tel:${phone}`}>{phone}</a>
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
              {profiles.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer me">
                    {new URL(url).hostname.replace(/^www\./, '').split('.')[0]}
                  </a>
                </li>
              ))}
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
