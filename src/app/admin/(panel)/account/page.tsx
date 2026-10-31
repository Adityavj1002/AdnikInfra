import { ActionForm } from '@/features/admin/ActionForm'
import { changeOwnPassword } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { PASSWORD_MIN } from '@/security/password'

export default async function AdminAccountPage() {
  const admin = await requireAdmin()
  return (
    <>
      <h1 className={styles.title}>My account</h1>
      <p className={styles.rowMeta}>{admin.name} · {admin.email}</p>
      <section className={styles.panel} aria-labelledby="password-title">
        <h2 id="password-title" className={styles.sectionTitle}>Change password</h2>
        <ActionForm action={changeOwnPassword} submitLabel="Change password" pendingLabel="Saving…" className={styles.formNarrow}>
          <div className="field">
            <label className="field__label" htmlFor="current-password">Current password</label>
            <input id="current-password" name="current" className="input" type="password" autoComplete="current-password" required />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="next-password">New password</label>
            <p className="field__hint">At least {PASSWORD_MIN} characters.</p>
            <input id="next-password" name="next" className="input" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
          </div>
        </ActionForm>
      </section>
    </>
  )
}
