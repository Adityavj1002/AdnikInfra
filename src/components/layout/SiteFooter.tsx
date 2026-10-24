import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { site } from '@/config/site'
import { getLocalities, getProjects, isSampleContent } from '@/content/repository'
import { routes } from '@/lib/routes'
import { Logo } from './Logo'
import styles from './SiteFooter.module.css'

export async function SiteFooter() {
  const [localities, projects] = await Promise.all([getLocalities(), getProjects()])
  const { email, phone, whatsapp, hours } = site.contact
  const address = site.business.address

  const columns = [
    {
      title: 'Our projects',
      links: [...projects.slice(0, 4).map((p) => ({ href: routes.project(p.slug), label: p.name })), { href: routes.projects, label: 'All projects' }],
    },
    {
      title: 'Real Estate in Jaipur',
      links: [...localities.map((l) => ({ href: routes.location(l.slug), label: l.name })), { href: routes.properties, label: 'All Real Estate' }],
    },
    {
      title: 'Company',
      links: [
        { href: routes.construction, label: 'Home construction' },
        { href: routes.about, label: 'About us' },
        { href: routes.blog, label: 'Guides & blog' },
        { href: routes.contact, label: 'Contact' },
      ],
    },
  ] as const

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Logo inverse />
          <p className={styles.about}>
            Builders and real estate developers in Jaipur. We build modern villas, apartments and plotted communities,
            and construct homes on our customers’ own plots.
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

      <div className={`container ${styles.disclaimer}`}>
        <p>
          <strong>Disclaimer:</strong> Images, layouts and specifications shown are for representation only and may change.
          Prices exclude registration, stamp duty and other statutory charges. Check each project’s registration on the
          Rajasthan RERA website before booking. <Link href={routes.disclaimer}>Read the full disclaimer</Link>.
        </p>
        {isSampleContent && (
          <p className={styles.sample}>
            Sample content: projects, prices, figures and photographs on this site are placeholders while it is being built.
          </p>
        )}
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {new Date().getFullYear()} {site.name}, {site.city}
        </p>
        <ul role="list" className={styles.legal}>
          <li>
            <Link href={routes.privacy} className={styles.link}>
              Privacy
            </Link>
          </li>
          <li>
            <Link href={routes.disclaimer} className={styles.link}>
              Disclaimer
            </Link>
          </li>
          <li>
            <Link href={routes.accessibility} className={styles.link}>
              Accessibility
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}
