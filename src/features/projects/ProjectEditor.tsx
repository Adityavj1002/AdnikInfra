import { amenityMeta } from '@/components/ui/amenities'
import type { Locality } from '@/content/types'
import { ActionForm } from '@/features/admin/ActionForm'
import { saveProject } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { cloudBase, photoBase } from '@/features/media/media'
import { AMENITY_KEYS, PHOTOS_LIMIT, PLANS_LIMIT, resolvePhoto, type PhotoRef, type ProjectRecord } from './content'
import { PhotoManager } from './PhotoManager'
import { bullets, facts, homes, nearby, paragraphs, specifications, units, updates } from './text'
import { VideoManager } from './VideoManager'
import { projectStatusLabel, projectTypeLabel } from '@/lib/format'

function TextArea({ name, label, hint, value, rows = 6 }: Readonly<{ name: string; label: string; hint?: string; value: string; rows?: number }>) {
  const prose = name === 'description' || name === 'filmTranscript'
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
        className={prose ? 'textarea' : `textarea ${styles.mono}`}
        rows={rows}
        defaultValue={value}
        spellCheck={prose}
        {...(hint ? { 'aria-describedby': `project-${name}-hint` } : {})}
      />
    </div>
  )
}

/** Library photos carry their URL for the preview; admin uploads are previewed by id. */
const withPreview = (photos: readonly PhotoRef[]) =>
  photos.map((photo) => {
    const img = photo.ref.startsWith('cloud:') ? resolvePhoto(photo) : undefined
    return img ? { ...photo, preview: img.src.src } : photo
  })

type Props = Readonly<{ mode: 'create' | 'edit'; slug?: string; record: ProjectRecord; localities: readonly Locality[] }>

/** The project form in Admin → Projects: every field the project page shows. */
export function ProjectEditor({ mode, slug, record, localities }: Props) {
  const film = record.film
  return (
    <ActionForm action={saveProject} submitLabel={mode === 'create' ? 'Create project' : 'Save project'} pendingLabel="Saving…" className={styles.projectForm}>
      <input type="hidden" name="mode" value={mode} />
      {mode === 'edit' && <input type="hidden" name="slug" value={slug} />}

      <section className={styles.panel} aria-labelledby="basics-title">
        <h2 id="basics-title" className={styles.sectionTitle}>Basics</h2>
        <div className={styles.fieldGrid}>
          <div className="field">
            <label className="field__label" htmlFor="project-name">Project name</label>
            <input id="project-name" name="name" className="input" type="text" defaultValue={record.name} required minLength={2} maxLength={80} />
          </div>
          {mode === 'create' && (
            <div className="field">
              <label className="field__label" htmlFor="project-slug">Web address</label>
              <p className="field__hint" id="project-slug-hint">Optional, e.g. liv-gyan-jagatpura. Left empty, it is made from the name. It can’t be changed later.</p>
              <input id="project-slug" name="slug" className="input" type="text" maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" aria-describedby="project-slug-hint" />
            </div>
          )}
          <div className="field">
            <label className="field__label" htmlFor="project-tagline">Tagline</label>
            <input id="project-tagline" name="tagline" className="input" type="text" defaultValue={record.tagline} required minLength={3} maxLength={120} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="project-locality">Area</label>
            <select id="project-locality" name="locality" className="select" defaultValue={record.localitySlug}>
              {localities.map((locality) => (
                <option key={locality.slug} value={locality.slug}>{locality.name}</option>
              ))}
            </select>
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
            <label className="field__label" htmlFor="project-stage">Stage label</label>
            <p className="field__hint" id="project-stage-hint">Shown on the badge instead of the status, e.g. “Finishing stage” or “Ready to shift”. Optional.</p>
            <input id="project-stage" name="stage" className="input" type="text" defaultValue={record.stage ?? ''} maxLength={40} aria-describedby="project-stage-hint" />
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
        <PhotoManager initial={withPreview(record.photos)} photoBase={photoBase()} limit={PHOTOS_LIMIT} />
      </section>

      <section className={styles.panel} aria-labelledby="plans-title">
        <h2 id="plans-title" className={styles.sectionTitle}>Floor plans</h2>
        <PhotoManager
          name="plans"
          label="Floor plans"
          hint="Unit plans or 3D views, shown under Configurations and plans. Optional."
          min={0}
          initial={withPreview(record.plans)}
          photoBase={photoBase()}
          limit={PLANS_LIMIT}
        />
      </section>

      <section className={styles.panel} aria-labelledby="video-title">
        <h2 id="video-title" className={styles.sectionTitle}>Video</h2>
        <VideoManager
          {...(film ? { initial: { video: film.video, portrait: film.portrait, seconds: film.seconds, uploadDate: film.uploadDate, ...(film.poster ? { poster: film.poster } : {}) } } : {})}
          {...(cloudBase('video') ? { videoBase: cloudBase('video') } : {})}
        />
        <div className={styles.fieldGrid}>
          <div className="field">
            <label className="field__label" htmlFor="project-filmTitle">Video title</label>
            <input id="project-filmTitle" name="filmTitle" className="input" type="text" defaultValue={film?.title ?? ''} maxLength={120} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="project-filmDescription">Video description</label>
            <input id="project-filmDescription" name="filmDescription" className="input" type="text" defaultValue={film?.description ?? ''} maxLength={300} />
          </div>
        </div>
        <TextArea name="filmTranscript" label="What the video shows" hint="One line per scene. Read by Google and by people who can’t play the video." value={bullets.format(film?.transcript ?? [])} rows={4} />
      </section>

      <section className={styles.panel} aria-labelledby="homes-title">
        <h2 id="homes-title" className={styles.sectionTitle}>Homes and areas</h2>
        <TextArea name="configurations" label="Home types" hint={`One per line: ${homes.shape} (super built-up). Leave “to” out for a single size; write “sq yd” after a plot size.`} value={homes.format(record.configurations)} rows={4} />
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
        <TextArea name="nearby" label="Nearby places" hint={`One per line: ${nearby.shape}. Leave the distance out if you don’t know it.`} value={nearby.format(record.nearby)} rows={10} />
      </section>

      <section className={styles.panel} aria-labelledby="updates-title">
        <h2 id="updates-title" className={styles.sectionTitle}>Construction progress</h2>
        <TextArea name="updates" label="Progress updates" hint={`One per line: ${updates.shape}. Leave empty to hide the section.`} value={updates.format(record.updates)} rows={4} />
      </section>
    </ActionForm>
  )
}
