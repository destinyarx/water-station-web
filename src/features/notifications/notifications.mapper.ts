import type { NotificationRow } from './notifications.schema'
import type { Notification } from './notifications.types'

export function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
  }
}
