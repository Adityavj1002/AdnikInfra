import Link from 'next/link'
import { notFound } from 'next/navigation'
import { amenityMeta } from '@/components/ui/amenities'
import { projects as bundled } from '@/content/fixtures/projects'
import { isValidSlug } from '@/content/repository'
import { ActionForm } from '@/features/admin/ActionForm'
import { saveProject } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { photoBase } from '@/features/marketplace/media'
import { AMENITY_KEYS, PHOTOS_LIMIT, resolvePhoto, savedProjects, toRecord } from '@/features/projects/content'
import { PhotoManager } from '@/features/projects/PhotoManager'
import { facts, homes, nearby, paragraphs, specifications, units } from '@/features/projects/text'
import { projectStatusLabel, projectTypeLabel } from '@/lib/format'
import { routes } from '@/lib/routes'

type Props = Readonly<{ params: Promise<{ slug: string }> }>

function TextArea({ name, label, hint, value, rows = 6 }: Readonly<{ name: string; label: string; hint?: string; value: string; rows?: number }>) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={`project-${name}`}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={`project-${name}-hint`}>
          {hint}
        </p>
      )}
      <textarea
        id={`project-${name}`}
        name={name}
        // Lists are typed as aligned text; the description is prose.
        className={name === 'description' ? 'textarea' : `textarea ${styles.mono}`}
        rows={rows}
        defaultValue={value}
        spellCheck={name === 'description'}
        {...(hint ? { 'aria-describedby': `project-${name}-hint` } : {})}
      />
    </div>
  )
}

export default async function AdminProjectPage({ params }: Props) {
  await requireAdmin()
  const { slug } = await params
  const base = isValidSlug(slug) ? bundled.find((p) => p.slug === slug) : undefined
  if (!base) notFound()
  const record = (await savedProjects())[slug]?.record ?? toRecord(base)
  const photos = record.photos.map((photo) => {
    const img = photo.ref.startsWith('static:') ? resolvePhoto(photo) : undefined
    return img ? { ...photo, preview: img.src.src } : photo
  })

  return (
    <>
      <p className={styles.rowMeta}>
        <Link href={routes.adminProjects}>Projects</Link> · <Link href={routes.project(slug)}>View on website</Link>
      </p>
      <h1 className={styles.title}>Edit {record.name}</h1>
      <ActionForm action={saveProject} submitLabel="Save project" pendingLabel="Saving…" className={styles.projectForm}>
        <input type="hidden" name="slug" value={slug} />

        <section className={styles.panel} aria-labelledby="basics-title">
          <h2 id="basics-title" className={styles.sectionTitle}>Basics</h2>
          <div className={styles.fieldGrid}>
            <div className="field">
              <label className="field__label" htmlFor="project-name">Project name</label>
              <input id="project-name" name="name" className="input" type="text" defaultValue={record.name} required minLength={2} maxLength={80} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="project-tagline">Tagline</label>
              <input id="project-tagline" name="tagline" className="input" type="text" defaultValue={record.tagline} required minLength={3} maxLength={120} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="project-type">Type</label>
              <select id="project-type" name="type" className="select" defaultValue={record.type}>
                {(['apartment', 'villa', 'plot', 'commercial'] as const).map((type) => (
                  <option key={type} value={type}>{projectTypeLabel[type]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="project-status">Status</label>
              <select id="project-status" name="status" className="select" defaultValue={record.status}>
                {(['ongoing', 'upcoming', 'completed'] as const).map((status) => (
                  <option key={status} value={status}>{projectStatusLabel[status]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="project-possession">Possession</label>
              <input id="project-possession" name="possession" className="input" type="text" defaultValue={record.possession} required maxLength={60} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="project-address">Address</label>
              <input id="project-address" name="address" className="input" type="text" defaultValue={record.address} maxLength={200} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="project-summary">Summary</label>
            <p className="field__hint" id="project-summary-hint">50 to 160 characters. Shown on cards and as the Google description.</p>
            <textarea id="project-summary" name="summary" className="textarea" rows={3} defaultValue={record.summary} required minLength={50} maxLength={160} aria-describedby="project-summary-hint" />
          </div>
          <TextArea name="description" label="Description" hint="Leave a blank line between paragraphs." value={paragraphs.format(record.description)} rows={10} />
        </section>

        <section className={styles.panel} aria-labelledby="photos-title">
          <h2 id="photos-title" className={styles.sectionTitle}>Photos</h2>
          <PhotoManager initial={photos} photoBase={photoBase()} limit={PHOTOS_LIMIT} />
        </section>

        <section className={styles.panel} aria-labelledby="homes-title">
          <h2 id="homes-title" className={styles.sectionTitle}>Homes and areas</h2>
          <TextArea name="configurations" label="Home types" hint={`One per line: ${homes.shape} (super built-up). Leave “to” out for a single size.`} value={homes.format(record.configurations)} rows={4} />
          <TextArea name="units" label="Unit-wise areas" hint={`One per line, in sq ft: ${units.shape}. Leave empty to hide the table.`} value={units.format(record.units)} rows={12} />
          <TextArea name="facts" label="Key facts" hint={`One per line: ${facts.shape}`} value={facts.format(record.facts)} rows={6} />
        </section>

        <section className={styles.panel} aria-labelledby="amenities-title">
          <h2 id="amenities-title" className={styles.sectionTitle}>Amenities</h2>
          <fieldset className={styles.checkGrid}>
            <legend className="visually-hidden">Amenities</legend>
            {AMENITY_KEYS.map((key) => (
              <label key={key} className="choice" htmlFor={`amenity-${key}`}>
                <input id={`amenity-${key}`} type="checkbox" name="amenities" value={key} defaultChecked={record.amenities.includes(key)} />
                <span>{amenityMeta[key].label}</span>
              </label>
            ))}
          </fieldset>
        </section>

        <section className={styles.panel} aria-labelledby="details-title">
          <h2 id="details-title" className={styles.sectionTitle}>Specifications and location</h2>
          <TextArea name="specifications" label="Specifications" hint="A heading line, then one point per line. Leave a blank line between groups." value={specifications.format(record.specifications)} rows={14} />
          <TextArea name="nearby" label="Nearby places" hint={`One per line: ${nearby.shape}`} value={nearby.format(record.nearby)} rows={10} />
        </section>
      </ActionForm>
    </>
  )
}
