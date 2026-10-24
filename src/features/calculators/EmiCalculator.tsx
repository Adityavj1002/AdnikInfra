'use client'

import { useId, useState } from 'react'
import { formatRupees } from '@/lib/format'
import styles from './Calculators.module.css'

/** Standard reducing-balance EMI. Exported for unit tests. */
export function monthlyEmi(principal: number, annualRatePercent: number, years: number): number {
  const months = Math.round(years * 12)
  if (principal <= 0 || months <= 0) return 0
  const r = annualRatePercent / 12 / 100
  if (r === 0) return principal / months
  const growth = (1 + r) ** months
  return (principal * r * growth) / (growth - 1)
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

type Props = Readonly<{ price?: number }>

export function EmiCalculator({ price }: Props) {
  const id = useId()
  const [loan, setLoan] = useState(() => Math.round(((price ?? 6_000_000) * 0.8) / 100_000) * 100_000)
  const [rate, setRate] = useState(8.5)
  const [years, setYears] = useState(20)

  const emi = monthlyEmi(loan, rate, years)
  const total = emi * years * 12
  const interest = Math.max(0, total - loan)
  const principalShare = total > 0 ? Math.round((loan / total) * 100) : 100

  return (
    <div className={styles.calculator}>
      <div className={styles.inputs}>
        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-loan`}>Loan amount</label>
            <output htmlFor={`${id}-loan`} className="nums">
              {formatRupees(loan)}
            </output>
          </div>
          <input
            id={`${id}-loan`}
            type="range"
            min={500_000}
            max={50_000_000}
            step={100_000}
            value={loan}
            onChange={(e) => setLoan(clamp(Number(e.target.value), 500_000, 50_000_000))}
            className={styles.range}
          />
        </div>
        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-rate`}>Interest rate (% per year)</label>
            <output htmlFor={`${id}-rate`} className="nums">
              {rate.toFixed(2)}%
            </output>
          </div>
          <input
            id={`${id}-rate`}
            type="range"
            min={6}
            max={14}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(clamp(Number(e.target.value), 6, 14))}
            className={styles.range}
          />
        </div>
        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-years`}>Loan tenure</label>
            <output htmlFor={`${id}-years`} className="nums">
              {years} years
            </output>
          </div>
          <input
            id={`${id}-years`}
            type="range"
            min={5}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(clamp(Number(e.target.value), 5, 30))}
            className={styles.range}
          />
        </div>
      </div>

      <div className={styles.result} aria-live="polite">
        <p className={styles.resultLabel}>Your monthly EMI</p>
        <p className={`nums ${styles.resultValue}`}>{formatRupees(emi)}</p>
        <div className={styles.split} aria-hidden="true">
          <span className={styles.splitPrincipal} style={{ inlineSize: `${principalShare}%` }} />
        </div>
        <dl className={styles.breakdown}>
          <div>
            <dt>Principal</dt>
            <dd className="nums">{formatRupees(loan)}</dd>
          </div>
          <div>
            <dt>Total interest</dt>
            <dd className="nums">{formatRupees(interest)}</dd>
          </div>
          <div>
            <dt>Total payable</dt>
            <dd className="nums">{formatRupees(total)}</dd>
          </div>
        </dl>
        <p className={styles.note}>Indicative only. Your bank’s rate, fees and eligibility will decide the final EMI.</p>
      </div>
    </div>
  )
}
