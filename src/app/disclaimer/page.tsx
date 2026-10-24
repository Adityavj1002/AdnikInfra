import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PageHero } from '@/components/ui/PageHero'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { buildTitle } from '@/seo/titles'

const description = `The ${site.name} website disclaimer: how images, prices, plans and RERA registration details on this site should be read.`

export const metadata = buildMetadata({ ...buildTitle({ name: 'Disclaimer' }), description, path: routes.disclaimer })

/** Standard Indian real-estate website disclaimer. To be reviewed by counsel before launch. */
export default function DisclaimerPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Home', path: routes.home }, { name: 'Disclaimer', path: routes.disclaimer }]} />
      <PageHero eyebrow="Legal" title="Disclaimer" lead={<p>Please read before relying on any information on this website.</p>} />
      <div className="container section section--tight">
        <div className="prose">
          <p>
            The content on this website, including images, renderings, layouts, floor plans, specifications, amenities and
            prices, is for general information and representation only. It does not form part of any offer or contract.
          </p>
          <h2>Images and plans</h2>
          <p>
            Photographs and renderings are artistic impressions or representative images and may differ from the actual
            project. Furniture, fixtures and landscaping shown are indicative.
          </p>
          <h2>Prices</h2>
          <p>
            Prices are indicative, subject to change without notice, and exclude registration, stamp duty, GST, maintenance
            and other statutory charges unless stated otherwise. The price in your signed agreement is final.
          </p>
          <h2>RERA</h2>
          <p>
            Where a project is registered under the Real Estate (Regulation and Development) Act, 2016, its Rajasthan RERA
            registration number is shown on its page. Please verify details on the Rajasthan RERA website before booking.
          </p>
          <h2>No booking without agreement</h2>
          <p>
            Visiting this website, or submitting an enquiry, does not book any property. Bookings are made only through a
            written agreement signed by both parties.
          </p>
        </div>
      </div>
    </>
  )
}
