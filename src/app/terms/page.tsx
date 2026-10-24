import { CircleCheck } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PageHero } from '@/components/ui/PageHero'
import legal from '@/components/ui/legal.module.css'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { buildTitle } from '@/seo/titles'

const UPDATED = '24 October 2026'
const description = `The terms for using the ${site.name} website: listings, prices, enquiries, payments and your rights, in plain language.`

export const metadata = buildMetadata({ ...buildTitle({ name: 'Terms of use' }), description, path: routes.terms })

const sections = [
  { id: 'about', title: 'About these terms' },
  { id: 'information', title: 'Listings, prices and plans' },
  { id: 'enquiries', title: 'Enquiries and site visits' },
  { id: 'payments', title: 'Bookings and payments' },
  { id: 'use', title: 'Using this website' },
  { id: 'content', title: 'Our content' },
  { id: 'links', title: 'Other websites' },
  { id: 'liability', title: 'Our responsibility' },
  { id: 'law', title: 'Law and disputes' },
  { id: 'changes', title: 'Changes and contact' },
] as const

/** Plain-language terms. Review with counsel before launch. */
export default function TermsPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Home', path: routes.home }, { name: 'Terms of use', path: routes.terms }]} />
      <PageHero eyebrow="Legal" title="Terms of use" lead={<p>The rules for using this website, written so you can actually read them.</p>} />

      <div className="container section section--tight">
        <div className={legal.layout}>
          <nav className={legal.toc} aria-label="On this page">
            <p className={legal.tocTitle}>On this page</p>
            <ul role="list" className={legal.tocList}>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <div className={legal.summary}>
              <h2 className={legal.summaryTitle}>In short</h2>
              <ul role="list" className={legal.summaryList}>
                {[
                  'Information on this site is a guide. Your signed agreement is what counts.',
                  'Nothing is booked through the website, and we never ask for payment here.',
                  'Pay only into the company account named in your signed agreement.',
                  'Check every project’s registration on the Rajasthan RERA website.',
                ].map((point) => (
                  <li key={point}>
                    <CircleCheck aria-hidden="true" className="icon" strokeWidth={1.75} />
                    {point}
                  </li>
                ))}
              </ul>
              <p className={legal.updated}>Last updated: {UPDATED}</p>
            </div>

            <div className="prose">
              <h2 id="about" className={legal.section}>
                About these terms
              </h2>
              <p>
                This website is run by {site.name} (“we”, “us”), {site.city}, {site.state}. By using it you agree to these
                terms. If you don’t agree, please don’t use the site.
              </p>

              <h2 id="information" className={legal.section}>
                Listings, prices and plans
              </h2>
              <p>
                We work hard to keep listings accurate, but images, renderings, layouts, specifications, amenities, prices
                and availability can change without notice. Prices exclude registration, stamp duty and other statutory
                charges unless we say otherwise. Nothing on this site is an offer or a contract: the terms that bind you and
                us are the ones in your signed application, allotment letter or agreement for sale. See our{' '}
                <Link href={routes.disclaimer}>disclaimer</Link> for more.
              </p>

              <h2 id="enquiries" className={legal.section}>
                Enquiries and site visits
              </h2>
              <p>
                When you send an enquiry or book a site visit, please give accurate details. We use them only to reply to
                you, as explained in our <Link href={routes.privacy}>privacy policy</Link>. A site visit is free and puts you
                under no obligation.
              </p>

              <h2 id="payments" className={legal.section}>
                Bookings and payments
              </h2>
              <p>
                You cannot book a property or a construction contract on this website. Bookings happen only through signed
                documents. We never ask for payment through the website, through links in messages, or into a personal
                account. If anyone asks you to pay that way in our name, don’t pay: contact us first.
              </p>

              <h2 id="use" className={legal.section}>
                Using this website
              </h2>
              <ul>
                <li>Use the site lawfully and only for your own property search or enquiry.</li>
                <li>Don’t send spam or false enquiries, or try to break, overload or probe the site’s security.</li>
                <li>Don’t copy listings or content in bulk, or with automated tools.</li>
              </ul>

              <h2 id="content" className={legal.section}>
                Our content
              </h2>
              <p>
                The {site.name} name, logo, text, designs and our own photographs belong to us. Some images are used under
                licence from their creators and are credited on the <Link href={routes.disclaimer}>disclaimer</Link> page.
                You may share links to our pages, but please ask before reusing our content.
              </p>

              <h2 id="links" className={legal.section}>
                Other websites
              </h2>
              <p>
                We link to other sites, such as Rajasthan RERA and Google Maps, for your convenience. We don’t control them
                and aren’t responsible for their content or privacy practices.
              </p>

              <h2 id="liability" className={legal.section}>
                Our responsibility
              </h2>
              <p>
                Please confirm the details that matter to you with our team, and in your documents, before you decide. To the
                extent the law allows, we aren’t responsible for losses caused by relying only on this website. Nothing in
                these terms limits rights you have under Indian law, including the Real Estate (Regulation and Development)
                Act, 2016 and consumer protection law.
              </p>

              <h2 id="law" className={legal.section}>
                Law and disputes
              </h2>
              <p>
                These terms are governed by the laws of India. If a dispute can’t be settled by talking to us first, the
                courts at {site.city}, {site.state} have jurisdiction.
              </p>

              <h2 id="changes" className={legal.section}>
                Changes and contact
              </h2>
              <p>
                We may update these terms, and the date at the top shows the latest version. Questions? Email{' '}
                {site.contact.email ? <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> : 'us'} or use our{' '}
                <Link href={routes.contact}>contact page</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
