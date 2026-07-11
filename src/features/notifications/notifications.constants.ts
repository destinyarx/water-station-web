export const NOTIFICATIONS_TABLE = 'notifications'

/** Only the columns the bell UI renders. Identity columns stay server-side. */
export const NOTIFICATION_COLUMNS = 'id, title, message, type, is_read, created_at'

/** Latest N fetched on load; realtime prepends new ones. See spec §7. */
export const NOTIFICATIONS_FETCH_LIMIT = 30

export const NOTIFICATIONS_LOAD_ERROR = 'Could not load notifications.'
export const NOTIFICATION_UPDATE_ERROR = 'Could not update the notification.'

/** Per-category UI hint: where a click routes, and the accent colour. */
export interface NotificationTypeMeta {
  route: string | null
  accent: string
}

/**
 * `type` is a free-form category, so unknown values fall back gracefully — a new
 * module can emit a new type with no code change here (routing just no-ops).
 */
const NOTIFICATION_TYPE_META: Record<string, NotificationTypeMeta> = {
  maintenance: { route: '/maintenances', accent: 'var(--app-chip-amber-text)' },
  delivery: { route: '/deliveries', accent: 'var(--app-brand)' },
  info: { route: null, accent: 'var(--app-brand)' },
}

const NOTIFICATION_TYPE_FALLBACK: NotificationTypeMeta = {
  route: null,
  accent: 'var(--app-brand)',
}

export function notificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_META[type] ?? NOTIFICATION_TYPE_FALLBACK
}
