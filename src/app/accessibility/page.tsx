import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PageHero } from '@/components/ui/PageHero'
import { site } from '@/config/site'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { buildTitle } from '@/seo/titles'

const description = `How the ${site.name} website is built to be usable by everyone, on every device, and how to tell us if something gets in your way.`

export const metadata = buildMetadata({ ...buildTitle({ name: 'Accessibility statement' }), description, path: routes.accessibility })

export default function AccessibilityPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ name: 'Home', path: routes.home }, { name: 'Accessibility', path: routes.accessibility }]} />
      <PageHero
        eyebrow="Accessibility"
        title="Accessibility statement"
        lead={<p>We want everyone to be able to use this site, on any device, however they browse.</p>}
      />
      <div className="container section section--tight">
        <div className="prose">
          <h2>Our standard</h2>
          <p>We design and test against the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
          <h2>In practice</h2>
          <ul>
            <li>Everything works with a keyboard, and focus is always visible.</li>
            <li>Text meets contrast requirements, and colour is never the only way information is shown.</li>
            <li>Animations stop if your device asks for reduced motion.</li>
            <li>Forms explain errors clearly and keep what you typed.</li>
            <li>Buttons and links are at least 44 pixels tall, and pages work on screens from 280 pixels wide.</li>
          </ul>
          <h2>Tell us</h2>
          <p>
            If anything is hard to use, please <Link href={routes.contact}>let us know</Link>. We will fix it, and help you
            in the meantime.
          </p>
        </div>
      </div>
    </>
  )
}
