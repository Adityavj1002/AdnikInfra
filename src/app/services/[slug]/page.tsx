import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import blocks from '@/components/ui/blocks.module.css'
import { servicePages } from '@/content/consultancy'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, consultancyServiceNode, faqNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

type Params = Readonly<{ params: Promise<{ slug: string }> }>

export function generateStaticParams() {
  return servicePages.map(({ slug }) => ({ slug }))
}

const find = async ({ params }: Params) => {
  const { slug } = await params
  return servicePages.find((page) => page.slug === slug)
}

export async function generateMetadata(props: Params) {
  const page = await find(props)
  if (!page) return {}
  return buildMetadata({ title: buildTitle({ name: page.metaTitle }).title, description: page.metaDescription, path: routes.service(page.slug) })
}

export default async function ServicePage(props: Params) {
  const page = await find(props)
  if (!page) notFound()
  const path = routes.service(page.slug)
  const crumbs: readonly Crumb[] = [
    { name: 'Home', path: routes.home },
    { name: 'Services', path: routes.services },
    { name: page.title, path },
  ]
  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path, name: page.metaTitle, description: page.metaDescription, breadcrumb: true }),
          breadcrumbNode(path, crumbs),
          consultancyServiceNode({ path, name: page.title, description: page.metaDescription, serviceType: page.serviceType }),
          faqNode(path, page.faqs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero eyebrow={page.title} title={page.heading} lead={<p>{page.lead}</p>} />

      <section className="section section--tight" aria-labelledby="includes-title">
        <div className="container stack">
          <SectionHeading id="includes-title" title="What this covers" intro={<p>{page.who}</p>} />
          <ul role="list" className={blocks.features}>
            {page.includes.map((item) => (
              <li key={item.title} className={blocks.feature}>
                <h3 className={blocks.featureTitle}>{item.title}</h3>
                <p className={blocks.featureBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--ivory" aria-labelledby="how-title">
        <div className="container stack">
          <SectionHeading id="how-title" title="How it works" />
          <ol className={`${blocks.steps} ${blocks.stepsGrid}`}>
            {page.steps.map((step) => (
              <li key={step.title} className={blocks.step}>
                <h3 className={blocks.stepTitle}>{step.title}</h3>
                <p className={blocks.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="container stack">
          <SectionHeading id="faq-title" title="Questions" />
          <FaqList faqs={page.faqs} />
        </div>
      </section>

      <CtaBand
        id="service-cta"
        title="Tell us about your project"
        body="Send the location, type of project and your timeline. We will reply with the approvals needed and a scope of work."
        primary={{ href: contactHref('proposal', page.slug), label: 'Request a proposal' }}
      />
    </>
  )
}
