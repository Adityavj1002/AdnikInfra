import Link from 'next/link'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PropertyCard } from '@/components/ui/Cards'
import { PageHero } from '@/components/ui/PageHero'
import blocks from '@/components/ui/blocks.module.css'
import { getLocalities, getProperties, type PropertySort } from '@/content/repository'
import { BUDGETS, PROPERTY_TYPES } from '@/features/search/options'
import { PropertySearch } from '@/features/search/PropertySearch'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './properties.module.css'

const SORTS = ['newest', 'price-asc', 'price-desc'] as const satisfies readonly PropertySort[]
const sortLabels: Readonly<Record<PropertySort, string>> = {
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
}

// Every parameter is checked against an allowlist; anything else is silently dropped.
const filterSchema = z.object({
  type: z.enum(PROPERTY_TYPES.map((t) => t.value) as [string, ...string[]]).optional().catch(undefined),
  locality: z.string().max(40).optional().catch(undefined),
  budget: z.enum(BUDGETS.map((b) => b.value) as [string, ...string[]]).optional().catch(undefined),
  bhk: z.enum(['1', '2', '3', '4']).optional().catch(undefined),
  sort: z.enum(SORTS).optional().catch(undefined),
})

const description =
  'Real estate for sale in Jaipur: ready-to-move flats, villas, plots and commercial spaces, verified by Vijay Builders. Filter by area, budget and bedrooms.'
const { title } = buildTitle({ name: 'Real Estate for Sale in Jaipur' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Real Estate', path: routes.properties },
]

type PageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>

function parse(raw: Record<string, string | string[] | undefined>) {
  const pick = (key: string) => (typeof raw[key] === 'string' ? (raw[key] as string) : undefined)
  return filterSchema.parse({
    type: pick('type'),
    locality: pick('locality'),
    budget: pick('budget'),
    bhk: pick('bhk'),
    sort: pick('sort'),
  })
}

export async function generateMetadata({ searchParams }: PageProps) {
  const filters = parse(await searchParams)
  const filtered = Object.values(filters).some(Boolean)
  return buildMetadata({ title, description, path: routes.properties, noindex: filtered })
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const filters = parse(await searchParams)
  const localities = await getLocalities()
  const locality = localities.some((l) => l.slug === filters.locality) ? filters.locality : undefined
  const properties = await getProperties({
    type: filters.type as (typeof PROPERTY_TYPES)[number]['value'] | undefined,
    locality,
    bhk: filters.bhk ? Number(filters.bhk) : undefined,
    maxPrice: BUDGETS.find((b) => b.value === filters.budget)?.max,
    sort: filters.sort,
  })

  const sortHref = (sort: PropertySort) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries({ ...filters, locality, sort })) if (value) params.set(key, String(value))
    return `${routes.properties}?${params.toString()}`
  }

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.properties, name: title, description, type: 'SearchResultsPage', breadcrumb: true }),
          breadcrumbNode(routes.properties, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero
        eyebrow="Real Estate"
        title="Real estate for sale in Jaipur"
        lead={<p>Flats, villas, plots and offices, each one visited and checked by our team before it’s listed.</p>}
      />

      <div className="container">
        <PropertySearch
          localities={localities}
          variant="bar"
          values={{ type: filters.type, locality, budget: filters.budget, bhk: filters.bhk }}
        />

        <div className={styles.toolbar}>
          <p className={styles.count} aria-live="polite">
            {properties.length} {properties.length === 1 ? 'real estate listing' : 'real estate listings'} found
          </p>
          <nav aria-label="Sort results">
            <ul role="list" className="chips">
              {SORTS.map((sort) => (
                <li key={sort}>
                  <Link
                    href={sortHref(sort)}
                    className="chip"
                    aria-current={(filters.sort ?? 'newest') === sort ? 'true' : undefined}
                  >
                    {sortLabels[sort]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <section className="section section--tight" aria-label="Search results">
        <div className="container">
          {properties.length > 0 ? (
            <div className="grid-cards">
              {properties.map((property) => (
                <PropertyCard
                  key={property.slug}
                  item={property}
                  headingLevel="h2"
                  locality={localities.find((l) => l.slug === property.localitySlug)}
                />
              ))}
            </div>
          ) : (
            <div className={blocks.empty}>
              <h2>Nothing matches yet</h2>
              <p>Try a wider budget or another area, or tell us what you need and we’ll call you when it’s listed.</p>
              <div className={styles.emptyActions}>
                <Link href={routes.properties} className="button button--outline">
                  Clear filters
                </Link>
                <Link href={contactHref('buy')} className="button">
                  Tell us what you need
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="sell-title">
        <div className={`container ${styles.sell}`}>
          <div>
            <h2 id="sell-title" className={styles.sellTitle}>
              Want to sell your property?
            </h2>
            <p className={blocks.lead}>We verify, photograph and list it, and bring you serious, pre-qualified buyers.</p>
          </div>
          <Link href={contactHref('sell')} className="button">
            List your property
          </Link>
        </div>
      </section>
    </>
  )
}
