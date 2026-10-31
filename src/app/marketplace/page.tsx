import { Plus } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import { LISTING_KINDS, LISTING_PURPOSES, listingKindLabels, listingPurposeLabels } from '@/features/marketplace/constants'
import { ListingCard } from '@/features/marketplace/ListingCard'
import { photoBase } from '@/features/marketplace/media'
import styles from '@/features/marketplace/marketplace.module.css'
import { getStore, marketplaceEnabled } from '@/features/marketplace/runtime'
import type { Listing } from '@/features/marketplace/types'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'

const PAGE_SIZE = 12
const BUDGETS = [
  { value: 2_500_000, label: 'Up to ₹25 lakh' },
  { value: 5_000_000, label: 'Up to ₹50 lakh' },
  { value: 10_000_000, label: 'Up to ₹1 crore' },
  { value: 25_000_000, label: 'Up to ₹2.5 crore' },
] as const

// Every parameter is checked; anything else is silently dropped.
const filterSchema = z.object({
  kind: z.enum(LISTING_KINDS).optional().catch(undefined),
  purpose: z.enum(LISTING_PURPOSES).optional().catch(undefined),
  city: z.string().max(80).regex(/^[\p{L}\p{M}\d\s.'-]+$/u).optional().catch(undefined),
  budget: z.coerce.number().refine((value) => BUDGETS.some((b) => b.value === value)).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).optional().catch(undefined),
})

const description =
  'Property marketplace: plots, homes, shops and land listed by owners and agents. Our team checks and approves every listing before it goes live.'
const { title } = buildTitle({ name: 'Property Marketplace: Plots, Homes & Land' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Marketplace', path: routes.marketplace },
]

type Search = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ searchParams }: Readonly<{ searchParams: Search }>) {
  const filtered = Object.keys(await searchParams).length > 0
  return buildMetadata({ title, description, path: routes.marketplace, noindex: filtered })
}

export default async function MarketplacePage({ searchParams }: Readonly<{ searchParams: Search }>) {
  const filters = filterSchema.parse(await searchParams)
  const page = filters.page ?? 1
  let listings: readonly Listing[] = []
  let total = 0
  let failed = !marketplaceEnabled
  if (marketplaceEnabled) {
    try {
      const result = await (await getStore()).listListings({
        status: 'approved',
        filters: { kind: filters.kind, purpose: filters.purpose, city: filters.city, maxPrice: filters.budget },
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      })
      listings = result.items
      total = result.total
    } catch (error) {
      failed = true
      console.error(`[marketplace] list failed ${JSON.stringify({ error: String(error).slice(0, 120) })}`)
    }
  }
  const base = photoBase()
  const pageHref = (target: number) => {
    const params = new URLSearchParams()
    if (filters.kind) params.set('kind', filters.kind)
    if (filters.purpose) params.set('purpose', filters.purpose)
    if (filters.city) params.set('city', filters.city)
    if (filters.budget) params.set('budget', String(filters.budget))
    if (target > 1) params.set('page', String(target))
    const query = params.toString()
    return query ? `${routes.marketplace}?${query}` : routes.marketplace
  }

  return (
    <>
      <JsonLd graph={graph(webPageNode({ path: routes.marketplace, name: title, description, breadcrumb: true }), breadcrumbNode(routes.marketplace, crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Marketplace"
        title="Property marketplace: plots, homes and buildings"
        lead={<p>Listed by owners, agents and builders. Our team checks every listing before it goes live.</p>}
      >
        <Link href={routes.marketplaceSell} className="button">
          <Plus aria-hidden="true" strokeWidth={1.75} />
          List your property
        </Link>
      </PageHero>

      <section className="section section--tight" aria-label="Listings">
        <div className="container">
          <form method="get" action={routes.marketplace} role="search" aria-label="Filter listings" className={styles.filters}>
            <div className="field">
              <label className="field__label" htmlFor="filter-kind">Type</label>
              <select id="filter-kind" name="kind" className="select" defaultValue={filters.kind ?? ''}>
                <option value="">All types</option>
                {LISTING_KINDS.map((kind) => <option key={kind} value={kind}>{listingKindLabels[kind]}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="filter-purpose">For</label>
              <select id="filter-purpose" name="purpose" className="select" defaultValue={filters.purpose ?? ''}>
                <option value="">Sale or rent</option>
                {LISTING_PURPOSES.map((purpose) => <option key={purpose} value={purpose}>{listingPurposeLabels[purpose]}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="filter-city">City</label>
              <input id="filter-city" name="city" className="input" type="text" maxLength={80} defaultValue={filters.city ?? ''} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="filter-budget">Budget</label>
              <select id="filter-budget" name="budget" className="select" defaultValue={filters.budget ?? ''}>
                <option value="">Any budget</option>
                {BUDGETS.map((budget) => <option key={budget.value} value={budget.value}>{budget.label}</option>)}
              </select>
            </div>
            <button type="submit" className="button">Search</button>
          </form>

          {failed ? (
            <div className={styles.empty} role="status">
              <p>The marketplace is not available just now. Please check back shortly.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className={styles.empty}>
              <p>No listings match yet. Be the first to list a property here.</p>
              <Link href={routes.marketplaceSell} className="button button--outline">List your property</Link>
            </div>
          ) : (
            <>
              <p className={styles.count} aria-live="polite">
                {total} {total === 1 ? 'listing' : 'listings'} found
              </p>
              <div className="grid-cards">
                {listings.map((listing) => <ListingCard key={listing.id} listing={listing} base={base} />)}
              </div>
              {total > PAGE_SIZE && (
                <nav className={styles.pager} aria-label="Pages">
                  {page > 1 ? <Link href={pageHref(page - 1)} className="button button--outline">Previous</Link> : <span />}
                  {page * PAGE_SIZE < total && <Link href={pageHref(page + 1)} className="button button--outline">Next</Link>}
                </nav>
              )}
            </>
          )}
          <p className={`${styles.notice} ${styles.noticeSpaced}`}>
            Listings come from their owners and agents. We check them before publishing, but please verify title, approvals
            and measurements yourself before paying anything.
          </p>
        </div>
      </section>
    </>
  )
}
