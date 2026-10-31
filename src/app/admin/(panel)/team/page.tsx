import { ActionForm } from '@/features/admin/ActionForm'
import { addAdmin, removeAdmin, resetAdminPassword } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { requireAdmin } from '@/features/admin/session'
import { getStore } from '@/features/marketplace/runtime'
import { PASSWORD_MIN } from '@/security/password'

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

export default async function AdminTeamPage() {
  const me = await requireAdmin()
  const admins = await (await getStore()).listAdmins()
  return (
    <>
      <h1 className={styles.title}>Team</h1>
      <section className={styles.section} aria-labelledby="admins-title">
        <h2 id="admins-title" className={styles.sectionTitle}>Admins</h2>
        <ul role="list" className={styles.list}>
          {admins.map((admin) => (
            <li key={admin.id} className={styles.panel}>
              <div>
                <p className={styles.rowTitle}>{admin.name}{admin.id === me.id ? ' (you)' : ''}</p>
                <p className={styles.rowMeta}>
                  {admin.email} · {admin.lastLoginAt ? `Last sign-in ${when.format(new Date(admin.lastLoginAt))} IST` : 'Has not signed in yet'}
                </p>
              </div>
              {admin.id !== me.id && (
                <>
                  <ActionForm action={resetAdminPassword} variant="outline" submitLabel="Reset password" pendingLabel="Saving…">
                    <input type="hidden" name="id" value={admin.id} />
                    <div className="field">
                      <label className="field__label" htmlFor={`reset-${admin.id}`}>New password for {admin.name}</label>
                      <input id={`reset-${admin.id}`} name="password" className="input" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
                    </div>
                  </ActionForm>
                  <ActionForm action={removeAdmin} variant="danger" submitLabel="Remove admin" pendingLabel="Removing…" confirm={`Remove ${admin.name} as an admin?`}>
                    <input type="hidden" name="id" value={admin.id} />
                  </ActionForm>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.panel} aria-labelledby="add-title">
        <h2 id="add-title" className={styles.sectionTitle}>Add an admin</h2>
        <ActionForm action={addAdmin} submitLabel="Add admin" pendingLabel="Adding…" className={styles.formNarrow}>
          <div className="field">
            <label className="field__label" htmlFor="admin-name">Name</label>
            <input id="admin-name" name="name" className="input" type="text" required maxLength={100} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="admin-email">Email</label>
            <input id="admin-email" name="email" className="input" type="email" autoCapitalize="none" spellCheck={false} required maxLength={254} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="admin-password">First password</label>
            <p className="field__hint">At least {PASSWORD_MIN} characters. Share it with them directly; it is never emailed.</p>
            <input id="admin-password" name="password" className="input" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
          </div>
        </ActionForm>
      </section>
    </>
  )
}
