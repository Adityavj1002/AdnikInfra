import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import { photoBase } from '@/features/marketplace/media'
import styles from '@/features/marketplace/marketplace.module.css'
import { marketplaceEnabled } from '@/features/marketplace/runtime'
import { SellForm } from '@/features/marketplace/SellForm'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

const description =
  'List your plot, home, shop or building on the Adnik Infra marketplace. Add photos and details; our team reviews every listing and publishes it once approved.'
const { title } = buildTitle({ name: 'List Your Property for Sale or Rent' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Marketplace', path: routes.marketplace },
  { name: 'List your property', path: routes.marketplaceSell },
]

export const metadata = buildMetadata({ title, description, path: routes.marketplaceSell })

export default function SellPage() {
  return (
    <>
      <JsonLd graph={graph(webPageNode({ path: routes.marketplaceSell, name: title, description, breadcrumb: true }), breadcrumbNode(routes.marketplaceSell, crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Marketplace"
        title="List your property for sale or rent"
        lead={<p>No account needed. Add your photos and details, confirm your email, and our team reviews the listing. It goes live only once approved.</p>}
      />
      <section className="section section--tight" aria-label="Listing form">
        <div className="container">
          {marketplaceEnabled ? (
            <SellForm photoBase={photoBase()} />
          ) : (
            <div className={styles.empty} role="status">
              <p>We are not taking new listings just now. Please check back shortly.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
