import { Mail, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import legal from '@/components/ui/legal.module.css'
import { site } from '@/config/site'
import { getFaqGroups } from '@/content/repository'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, faqNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

const description =
  'Answers on buying property, RERA, stamp duty, home loans, building on your plot and agricultural land in Jaipur and nearby towns.'
const { title } = buildTitle({ name: 'FAQs: Property & Construction in Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'FAQs', path: routes.faq },
]

export const metadata = buildMetadata({ title, description, path: routes.faq })

export default async function FaqPage() {
  const groups = await getFaqGroups()
  const all = groups.flatMap((group) => group.faqs)

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.faq, name: title, description, breadcrumb: true }),
          breadcrumbNode(routes.faq, crumbs),
          faqNode(routes.faq, all),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions about property in Jaipur"
        lead={<p>Straight answers on buying, building and land in Jaipur and the towns around it. Can’t find yours? Ask us.</p>}
      />

      <div className="container section section--tight">
        <div className={legal.layout}>
          <nav className={legal.toc} aria-label="FAQ topics">
            <p className={legal.tocTitle}>Topics</p>
            <ul role="list" className={legal.tocList}>
              {groups.map((group) => (
                <li key={group.slug}>
                  <a href={`#${group.slug}`}>{group.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            {groups.map((group) => (
              <section key={group.slug} id={group.slug} className={`${legal.group} ${legal.section}`} aria-labelledby={`${group.slug}-title`}>
                <h2 id={`${group.slug}-title`} className={legal.groupTitle}>
                  {group.title}
                </h2>
                <FaqList faqs={group.faqs} />
              </section>
            ))}

            <aside className={legal.help} aria-labelledby="help-title">
              <h2 id="help-title" className={legal.helpTitle}>
                Still have a question?
              </h2>
              <p>Our team answers every message personally. {site.contact.responseTime}</p>
              <div className={legal.helpActions}>
                <Link href={contactHref('other')} className="button button--gold">
                  <MessageCircle aria-hidden="true" strokeWidth={1.75} />
                  Ask us anything
                </Link>
                {site.contact.email && (
                  <a href={`mailto:${site.contact.email}`} className="button button--light">
                    <Mail aria-hidden="true" strokeWidth={1.75} />
                    {site.contact.email}
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
