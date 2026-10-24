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

const quickLinks: readonly FooterLink[] = [
  { href: routes.home, label: 'Home' },
  { href: routes.projects, label: 'Projects' },
  { href: routes.properties, label: 'Real estate' },
  { href: routes.construction, label: 'Home construction' },
  { href: routes.about, label: 'About us' },
  { href: routes.blog, label: 'Guides & blog' },
  { href: routes.faq, label: 'FAQs' },
  { href: routes.contact, label: 'Contact' },
]

const areaLinks: readonly FooterLink[] = [
  { href: routes.locations, label: 'Jaipur' },
  { href: routes.town('chaksu'), label: 'Chaksu' },
  { href: routes.town('niwai'), label: 'Niwai' },
  { href: routes.location('tonk-road'), label: 'Tonk Road' },
  { href: routes.town('bilwa'), label: 'Bilwa' },
  { href: routes.nearJaipur, label: 'All areas near Jaipur' },
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
    { title: 'Quick links', links: quickLinks },
    { title: 'Services', links: services.map((service) => ({ href: service.href, label: service.title })) },
    { title: 'Jaipur & nearby', links: areaLinks },
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
            Adnik Infra is a real estate and construction company serving Jaipur, Chaksu, Niwai, Tonk Road, Bilwa and
            nearby towns. We build modern villas and independent homes, sell plots, flats and agricultural land, and
            deliver construction projects with clear paperwork and written, all-inclusive pricing.
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
          © {new Date().getFullYear()} {site.name}. Powered by{' '}
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
