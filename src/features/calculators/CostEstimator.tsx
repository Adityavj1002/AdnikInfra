'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import type { ConstructionPackage } from '@/content/types'
import { formatRupees } from '@/lib/format'
import { contactHref } from '@/lib/routes'
import styles from './Calculators.module.css'

/** Indicative split of a construction budget. */
const BREAKDOWN = [
  { label: 'Structure (foundation, frame, masonry)', share: 0.45 },
  { label: 'Finishes (flooring, doors, paint)', share: 0.3 },
  { label: 'Electrical and plumbing', share: 0.15 },
  { label: 'Design and site supervision', share: 0.1 },
] as const

export function estimateCost(builtUpSqft: number, ratePerSqft: number): number {
  return Math.max(0, builtUpSqft) * Math.max(0, ratePerSqft)
}

/** Typical schedule in months: longer for more floors. */
export function estimateMonths(floors: number): readonly [number, number] {
  return [6 + floors * 2, 9 + floors * 3]
}

export function CostEstimator({ packages }: Readonly<{ packages: readonly ConstructionPackage[] }>) {
  const id = useId()
  const [area, setArea] = useState(1500)
  const [floors, setFloors] = useState(2)
  const [packageSlug, setPackageSlug] = useState<ConstructionPackage['slug']>('premium')

  const pkg = packages.find((p) => p.slug === packageSlug) ?? packages[0]
  const builtUp = area * floors
  const total = pkg ? estimateCost(builtUp, pkg.ratePerSqft) : 0
  const [minMonths, maxMonths] = estimateMonths(floors)

  return (
    <div className={styles.calculator}>
      <div className={styles.inputs}>
        <div className={styles.control}>
          <label htmlFor={`${id}-area`} className={styles.label}>
            Built-up area per floor (sq ft)
          </label>
          <input
            id={`${id}-area`}
            className="input"
            type="number"
            inputMode="numeric"
            min={300}
            max={10000}
            step={50}
            value={area}
            onChange={(e) => setArea(Math.min(10000, Math.max(0, Math.round(Number(e.target.value) || 0))))}
          />
          <p className="field__hint">Usually 50–75% of your plot area.</p>
        </div>

        <fieldset className={`fieldset ${styles.control}`}>
          <legend className={styles.label}>Floors</legend>
          <div className={styles.segments}>
            {[1, 2, 3, 4].map((n) => (
              <label key={n} className={styles.segment}>
                <input type="radio" name={`${id}-floors`} value={n} checked={floors === n} onChange={() => setFloors(n)} />
                <span>{n === 1 ? 'G' : `G+${n - 1}`}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={`fieldset ${styles.control}`}>
          <legend className={styles.label}>Package</legend>
          <div className={styles.packages}>
            {packages.map((p) => (
              <label key={p.slug} className={styles.package}>
                <input type="radio" name={`${id}-package`} value={p.slug} checked={packageSlug === p.slug} onChange={() => setPackageSlug(p.slug)} />
                <span className={styles.packageName}>{p.name}</span>
                <span className={`nums ${styles.packageRate}`}>₹{p.ratePerSqft.toLocaleString('en-IN')}/sq ft</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.result} aria-live="polite">
        <p className={styles.resultLabel}>
          Estimated cost for {builtUp.toLocaleString('en-IN')} sq ft
        </p>
        <p className={`nums ${styles.resultValue}`}>{formatRupees(total)}</p>
        <dl className={styles.breakdown}>
          {BREAKDOWN.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd className="nums">{formatRupees(total * item.share)}</dd>
            </div>
          ))}
          <div>
            <dt>Typical timeline</dt>
            <dd className="nums">
              {minMonths}–{maxMonths} months
            </dd>
          </div>
        </dl>
        <p className={styles.note}>
          Indicative estimate at sample rates. Approvals, boundary walls and interiors are extra. A site visit gives an exact quote.
        </p>
        <Link href={contactHref('construction')} className="button button--gold">
          Get an exact quote
          <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
