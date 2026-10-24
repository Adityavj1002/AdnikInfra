import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PageHero } from '@/components/ui/PageHero'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { buildTitle } from '@/seo/titles'

const description = `How ${site.name} collects, uses and protects the details you share through our enquiry and site-visit forms.`

export const metadata = buildMetadata({ ...buildTitle({ name: 'Privacy notice' }), description, path: routes.privacy })

/** Plain-language summary of what the site actually does. To be reviewed by counsel before launch. */
export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Home', path: routes.home }, { name: 'Privacy', path: routes.privacy }]} />
      <PageHero eyebrow="Legal" title="Privacy notice" lead={<p>What we collect, why, and what you can ask us to do with it.</p>} />
      <div className="container section section--tight">
        <div className="prose">
          <h2>What we collect</h2>
          <p>
            Only what you type into our <Link href={routes.contact}>enquiry</Link> or site-visit forms: your name, mobile
            number, an optional email address, your preferred visit date and your message.
          </p>
          <h2>How we use it</h2>
          <p>To call or message you about your enquiry, arrange site visits and send the information you asked for.</p>
          <h2>What we don’t do</h2>
          <ul>
            <li>No advertising or tracking cookies, and no third-party trackers.</li>
            <li>No selling or sharing of your details, and no marketing lists you did not ask to join.</li>
            <li>No full personal details in our server logs.</li>
          </ul>
          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete what we hold about you at any time. We respond as required by India’s
            Digital Personal Data Protection Act, 2023.
          </p>
        </div>
      </div>
    </>
  )
}
