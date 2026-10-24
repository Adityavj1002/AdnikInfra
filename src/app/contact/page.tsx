import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import blocks from '@/components/ui/blocks.module.css'
import { site } from '@/config/site'
import { getProject, getProperty } from '@/content/repository'
import { ENQUIRY_TOPICS } from '@/features/enquiry/constants'
import { EnquiryForm } from '@/features/enquiry/EnquiryForm'
import { isSlug } from '@/lib/slug'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './contact.module.css'

const description =
  'Contact Vijay Builders in Jaipur: book a site visit, get a construction quote, or ask about buying and selling property. We reply within one working day.'
const { title } = buildTitle({ name: 'Contact Vijay Builders' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Contact', path: routes.contact },
]

// Deep-link parameters only pre-fill the form; anything unexpected is ignored.
const paramsSchema = z.object({
  topic: z.enum(ENQUIRY_TOPICS).optional().catch(undefined),
  ref: z.string().max(80).refine(isSlug).optional().catch(undefined),
})

type PageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>

export const metadata = buildMetadata({ title, description, path: routes.contact })

async function resolveAbout(ref: string | undefined) {
  if (!ref) return undefined
  const project = await getProject(ref)
  if (project) return { slug: project.slug, name: project.name }
  const property = await getProperty(ref)
  return property && { slug: property.slug, name: property.title }
}

export default async function ContactPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const { topic, ref } = paramsSchema.parse({
    topic: typeof raw.topic === 'string' ? raw.topic : undefined,
    ref: typeof raw.ref === 'string' ? raw.ref : undefined,
  })
  const about = await resolveAbout(ref)
  const { email, phone, whatsapp, hours } = site.contact
  const address = site.business.address

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.contact, name: title, description, type: 'ContactPage', breadcrumb: true }),
          breadcrumbNode(routes.contact, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Contact"
        title="Contact Vijay Builders"
        lead={<p>Book a site visit, get a construction quote, or ask us anything. {site.contact.responseTime}</p>}
      />

      <section className="section section--tight" aria-label="Contact options">
        <div className={`container ${styles.layout}`}>
          <div id="enquiry" className={blocks.panel}>
            <h2 className={blocks.panelTitle}>Send us a message</h2>
            <EnquiryForm defaultTopic={topic} about={about} />
          </div>

          <aside className={styles.aside} aria-label="Other ways to reach us">
            <ul role="list" className={styles.channels}>
              {phone && (
                <li>
                  <Phone aria-hidden="true" strokeWidth={1.75} />
                  <span>
                    <span className={styles.channelLabel}>Call</span>
                    <a href={`tel:${phone}`}>{phone}</a>
                  </span>
                </li>
              )}
              {whatsapp && (
                <li>
                  <MessageCircle aria-hidden="true" strokeWidth={1.75} />
                  <span>
                    <span className={styles.channelLabel}>WhatsApp</span>
                    <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      Message us
                    </a>
                  </span>
                </li>
              )}
              {email && (
                <li>
                  <Mail aria-hidden="true" strokeWidth={1.75} />
                  <span>
                    <span className={styles.channelLabel}>Email</span>
                    <a href={`mailto:${email}`}>{email}</a>
                  </span>
                </li>
              )}
              {address && (
                <li>
                  <MapPin aria-hidden="true" strokeWidth={1.75} />
                  <span>
                    <span className={styles.channelLabel}>Office</span>
                    {address.streetAddress}, {address.addressLocality} {address.postalCode}
                  </span>
                </li>
              )}
              <li>
                <Clock aria-hidden="true" strokeWidth={1.75} />
                <span>
                  <span className={styles.channelLabel}>Office hours</span>
                  {hours}
                </span>
              </li>
            </ul>
            <div className={styles.promise}>
              <h2 className={styles.promiseTitle}>What happens next</h2>
              <ol className={styles.promiseList}>
                <li>We call you back, usually the same day.</li>
                <li>We understand your budget, area and timeline.</li>
                <li>We arrange visits or send a written estimate.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
