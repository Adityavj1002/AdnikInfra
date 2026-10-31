import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ActionForm } from '@/features/admin/ActionForm'
import { login } from '@/features/admin/actions'
import styles from '@/features/admin/admin.module.css'
import { currentAdmin } from '@/features/admin/session'
import { marketplaceEnabled } from '@/features/marketplace/runtime'
import { routes } from '@/lib/routes'

export const metadata: Metadata = { title: 'Admin sign-in', robots: { index: false, follow: false } }

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect(routes.admin)
  return (
    <div className="container">
      <div className={styles.login}>
        <h1 className={styles.title}>Admin sign-in</h1>
        {marketplaceEnabled ? (
          <ActionForm action={login} submitLabel="Sign in" pendingLabel="Signing in…">
            <div className="field">
              <label className="field__label" htmlFor="login-email">Email</label>
              <input id="login-email" name="email" className="input" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="login-password">Password</label>
              <input id="login-password" name="password" className="input" type="password" autoComplete="current-password" required maxLength={200} />
            </div>
          </ActionForm>
        ) : (
          <p role="status">The admin panel is not switched on for this deployment.</p>
        )}
      </div>
    </div>
  )
}
