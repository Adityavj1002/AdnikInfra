import { CircleCheck } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PageHero } from '@/components/ui/PageHero'
import legal from '@/components/ui/legal.module.css'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { buildTitle } from '@/seo/titles'

const UPDATED = '31 October 2026'
const description = `How ${site.name} collects, uses and protects the details you share through our enquiry, site-visit and listing-alert forms.`

export const metadata = buildMetadata({ ...buildTitle({ name: 'Privacy policy' }), description, path: routes.privacy })

const sections = [
  { id: 'collect', title: 'What we collect' },
  { id: 'use', title: 'How we use it' },
  { id: 'share', title: 'Who sees it' },
  { id: 'keep', title: 'How long we keep it' },
  { id: 'cookies', title: 'Cookies and tracking' },
  { id: 'security', title: 'Keeping it safe' },
  { id: 'rights', title: 'Your rights' },
  { id: 'contact', title: 'Contact and complaints' },
] as const

/**
 * Plain-language notice describing what the site actually does (forms only, no tracking).
 * Written against India's Digital Personal Data Protection Act, 2023. Review with counsel.
 */
export default function PrivacyPage() {
  const email = site.contact.email
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Home', path: routes.home }, { name: 'Privacy policy', path: routes.privacy }]} />
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead={<p>What we collect, why, who sees it, and what you can ask us to do with it.</p>}
      />

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
                  'We only collect what you type into our forms.',
                  'We use it to answer you, and nothing else.',
                  'We never sell or rent your details, and there are no tracking or advertising cookies.',
                  'You can ask us to see, correct or delete your details at any time.',
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
              <h2 id="collect" className={legal.section}>
                What we collect
              </h2>
              <ul>
                <li>
                  <strong>Enquiry and site-visit forms:</strong> your name, mobile number, an optional email address, how
                  you would like us to contact you, your preferred visit date and time, the project or property you asked
                  about, and your message.
                </li>
                <li>
                  <strong>Marketplace listings:</strong> your name, mobile number, email address and whether you are the
                  owner, an agent or a builder, plus the property details and photos you add. The details and photos are
                  published once approved. Your phone and email are not shown publicly.
                </li>
                <li>
                  <strong>Newsletter:</strong> your email address, and when you subscribed and confirmed.
                </li>
                <li>
                  <strong>Technical data:</strong> like every website, our servers briefly see your IP address and browser
                  type when you visit. We use this only to keep the site secure and to stop spam.
                </li>
              </ul>

              <h2 id="use" className={legal.section}>
                How we use it
              </h2>
              <p>
                To reply to your enquiry, arrange site visits, send you the information or listings you asked for, and keep
                a record of our conversation. We use marketplace details to verify and review your listing and to tell you
                the outcome, and newsletter addresses to send new listings and offers to people who confirmed they want
                them. We process your details because you give us your consent when you submit a
                form. You can withdraw it at any time.
              </p>

              <h2 id="share" className={legal.section}>
                Who sees it
              </h2>
              <p>
                Our sales and construction team. Your enquiry reaches us by email, so our email provider and our website host
                process it on our behalf, under contract, and for no other purpose. Marketplace records are stored with our
                database provider (Supabase) and listing photos with our image host (Cloudinary), on the same terms. We share details with government
                authorities only when the law requires it. We never sell or rent your details, and we never add you to a
                marketing list you didn’t ask to join.
              </p>

              <h2 id="keep" className={legal.section}>
                How long we keep it
              </h2>
              <p>
                For as long as we need it to deal with your enquiry and any follow-up, and then we delete it, unless the law
                requires us to keep it longer (for example, the records of a property sale). Listings are kept while they are
                live and for our records afterwards; ask us and we will remove yours. Newsletter addresses are kept until you
                use the unsubscribe link in any of our emails.
              </p>

              <h2 id="cookies" className={legal.section}>
                Cookies and tracking
              </h2>
              <p>
                This website sets no advertising or analytics cookies and runs no third-party trackers. The only cookie is a
                secure sign-in cookie for our own admin team; visitors never receive it. Maps open on Google’s own site only
                when you choose to follow a map link.
              </p>

              <h2 id="security" className={legal.section}>
                Keeping it safe
              </h2>
              <p>
                The site is served only over an encrypted connection (HTTPS). Forms are protected against spam and abuse, full
                personal details never appear in our server logs, and only the people who need your details to help you can
                see them.
              </p>

              <h2 id="rights" className={legal.section}>
                Your rights
              </h2>
              <p>
                Under India’s Digital Personal Data Protection Act, 2023, you can ask us to tell you what we hold about you,
                correct it, delete it, or stop using it; you can withdraw your consent; and you can nominate someone to act
                for you. We reply to every request.
              </p>

              <h2 id="contact" className={legal.section}>
                Contact and complaints
              </h2>
              <p>
                For any privacy question or request, email {email ? <a href={`mailto:${email}`}>{email}</a> : 'us'} or use
                our <Link href={routes.contact}>contact page</Link>. If you are not satisfied with our answer, you can
                complain to the Data Protection Board of India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
