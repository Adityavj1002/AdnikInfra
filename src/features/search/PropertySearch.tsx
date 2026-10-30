import { Search } from 'lucide-react'
import type { Locality } from '@/content/types'
import { routes } from '@/lib/routes'
import { BUDGETS, PROPERTY_TYPES } from './options'
import styles from './PropertySearch.module.css'

type Props = Readonly<{
  localities: readonly Locality[]
  values?: Readonly<{ type?: string; locality?: string; budget?: string; bhk?: string }>
  /** "hero" floats over the home banner; "bar" sits above search results. */
  variant?: 'hero' | 'bar'
}>

/**
 * Plain GET form: no JavaScript, shareable result URLs, back button just works.
 * Every value is re-validated against an allowlist on the results page.
 */
export function PropertySearch({ localities, values = {}, variant = 'hero' }: Props) {
  return (
    <form action={routes.properties} method="get" role="search" aria-label="Search real estate" className={`${styles.search} ${styles[variant]}`}>
      <div className={styles.field}>
        <label htmlFor="search-type" className={styles.label}>
          Real estate type
        </label>
        <select id="search-type" name="type" className="select" defaultValue={values.type ?? ''}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="search-locality" className={styles.label}>
          Location
        </label>
        <select id="search-locality" name="locality" className="select" defaultValue={values.locality ?? ''}>
          <option value="">Jaipur &amp; nearby</option>
          {localities.map((locality) => (
            <option key={locality.slug} value={locality.slug}>
              {locality.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="search-budget" className={styles.label}>
          Budget
        </label>
        <select id="search-budget" name="budget" className="select" defaultValue={values.budget ?? ''}>
          <option value="">Any budget</option>
          {BUDGETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {variant === 'bar' && (
        <div className={styles.field}>
          <label htmlFor="search-bhk" className={styles.label}>
            Bedrooms
          </label>
          <select id="search-bhk" name="bhk" className="select" defaultValue={values.bhk ?? ''}>
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>
      )}
      <button type="submit" className={`button ${styles.submit}`}>
        <Search aria-hidden="true" strokeWidth={2} />
        Search
      </button>
    </form>
  )
}
