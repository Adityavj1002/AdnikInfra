import { ArrowUpRight, BedDouble, Building2, MapPin, Ruler } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Area, Locality, Project, Property } from '@/content/types'
import {
  formatArea,
  formatAreaRange,
  formatPrice,
  possessionText,
  projectStage,
  projectTypeLabel,
  propertyTypeLabel,
} from '@/lib/format'
import { routes } from '@/lib/routes'
import styles from './Cards.module.css'

const statusBadge: Record<Project['status'], string> = {
  ongoing: 'badge badge--gold',
  upcoming: 'badge badge--info',
  completed: 'badge badge--success',
}

/** Card sizes for next/image: one column on phones, two on tablets, three on desktop. */
const CARD_SIZES = '(min-width: 72rem) 400px, (min-width: 40rem) 50vw, 100vw'

/** Smallest to largest home across a project's configurations, when they share a unit. */
function sizeRange(project: Project): string | undefined {
  const areas = project.configurations.flatMap((c): readonly Area[] => (Array.isArray(c.area) ? (c.area as readonly Area[]) : [c.area as Area]))
  const first = areas[0]
  if (!first || areas.some((a) => a.unit !== first.unit)) return undefined
  const values = areas.map((a) => a.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const round = (value: number): Area => ({ value: Math.round(value), unit: first.unit })
  return min === max ? formatArea(round(min)) : formatAreaRange([round(min), round(max)])
}

type CardProps<T> = Readonly<{ item: T; locality?: Locality; headingLevel?: 'h2' | 'h3'; priority?: boolean }>

/** Whole card is one link with a real heading inside it: one big touch target, screen-reader friendly. */
export function ProjectCard({ item: project, locality, headingLevel: Heading = 'h3', priority }: CardProps<Project>) {
  const cover = project.gallery[0]
  const bhk = project.configurations.map((c) => c.label.replace(/ \(.*\)$/, '')).join(' · ')
  const sizes = sizeRange(project)
  return (
    <article className={styles.card}>
      <Link href={routes.project(project.slug)} className={styles.link}>
        <div className={styles.media}>
          {cover && (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes={CARD_SIZES}
              placeholder="blur"
              className={styles.image}
              {...(priority ? { loading: 'eager' as const } : {})}
            />
          )}
          <span className={`${statusBadge[project.status]} ${styles.status}`}>{projectStage(project)}</span>
        </div>
        <div className={styles.body}>
          <p className={styles.kicker}>
            <Building2 aria-hidden="true" className="icon" strokeWidth={1.75} /> {projectTypeLabel[project.type]}
          </p>
          <Heading className={styles.title}>{project.name}</Heading>
          {locality && (
            <p className={styles.location}>
              <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {locality.name}, Jaipur
            </p>
          )}
          <p className={styles.meta}>{bhk}</p>
          <div className={styles.footer}>
            <p className={styles.price}>
              <span className={styles.priceLabel}>{sizes ? 'Sizes' : 'Possession'}</span>
              <span className="nums">{sizes ?? project.possession}</span>
            </p>
            <span className={styles.arrow} aria-hidden="true">
              <ArrowUpRight strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function PropertyCard({ item: property, locality, headingLevel: Heading = 'h3' }: CardProps<Property>) {
  const cover = property.gallery[0]
  return (
    <article className={styles.card}>
      <Link href={routes.property(property.slug)} className={styles.link}>
        <div className={styles.media}>
          {cover && <Image src={cover.src} alt={cover.alt} fill sizes={CARD_SIZES} placeholder="blur" className={styles.image} />}
          <span className={`badge ${property.possession === 'ready' ? 'badge--success' : 'badge--info'} ${styles.status}`}>
            {possessionText(property.type, property.possession)}
          </span>
        </div>
        <div className={styles.body}>
          <p className={styles.kicker}>{propertyTypeLabel[property.type]}</p>
          <Heading className={styles.title}>{property.title}</Heading>
          {locality && (
            <p className={styles.location}>
              <MapPin aria-hidden="true" className="icon" strokeWidth={1.75} /> {locality.name}, Jaipur
            </p>
          )}
          <ul role="list" className={styles.specs}>
            {property.bhk && (
              <li>
                <BedDouble aria-hidden="true" className="icon" strokeWidth={1.75} /> {property.bhk} BHK
              </li>
            )}
            <li>
              <Ruler aria-hidden="true" className="icon" strokeWidth={1.75} /> {formatArea(property.area)}
            </li>
          </ul>
          <div className={styles.footer}>
            <p className={styles.price}>{formatPrice(property.price)}</p>
            <span className={styles.arrow} aria-hidden="true">
              <ArrowUpRight strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

