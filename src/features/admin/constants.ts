/** Client-safe form state shared by the admin screens. */
export type AdminFormState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'ok'; message: string }>
  | Readonly<{ status: 'error'; message: string }>

export const initialAdminFormState: AdminFormState = { status: 'idle' }
