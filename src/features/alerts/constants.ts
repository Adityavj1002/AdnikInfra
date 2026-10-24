/** Client-safe state for the listing-alerts form (no Zod here, see enquiry/constants.ts). */
export type AlertsState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'success' }>
  | Readonly<{ status: 'error'; email: string }>
  | Readonly<{ status: 'unavailable' }>
  | Readonly<{ status: 'rate-limited' }>

export const initialAlertsState: AlertsState = { status: 'idle' }
