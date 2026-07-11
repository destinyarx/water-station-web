import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  NOTIFICATIONS_FETCH_LIMIT,
  NOTIFICATIONS_LOAD_ERROR,
  NOTIFICATIONS_TABLE,
  NOTIFICATION_COLUMNS,
  NOTIFICATION_UPDATE_ERROR,
} from '../notifications.constants'
import { toNotification } from '../notifications.mapper'
import { notificationRowSchema } from '../notifications.schema'
import type { Notification } from '../notifications.types'

const rowsSchema = z.array(notificationRowSchema)

/**
 * Loads the caller's latest notifications (RLS scopes to `recipient_id = sub`
 * within the caller's org). Newest first, capped at {@link NOTIFICATIONS_FETCH_LIMIT}.
 */
export async function getNotifications(
  client: SupabaseClient,
): Promise<Notification[]> {
  const { data, error } = await client
    .from(NOTIFICATIONS_TABLE)
    .select(NOTIFICATION_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(NOTIFICATIONS_FETCH_LIMIT)

  if (error) throw new Error(NOTIFICATIONS_LOAD_ERROR)

  return rowsSchema.parse(data ?? []).map(toNotification)
}

/**
 * Marks one notification read. Only `is_read` is written — the `GRANT UPDATE
 * (is_read)` column privilege rejects any attempt to touch other columns; RLS
 * scopes the row to the caller.
 *
 * The `.select().single()` is deliberate: if RLS/privileges silently match zero
 * rows (e.g. the UPDATE policy or column grant wasn't applied), Postgres returns
 * success with no rows — `.single()` then errors, surfacing the misconfiguration
 * instead of the UI appearing to work but never persisting.
 */
export async function markNotificationRead(
  client: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client
    .from(NOTIFICATIONS_TABLE)
    .update({ is_read: true })
    .eq('id', id)
    .select('id')
    .single()

  if (error) throw new Error(NOTIFICATION_UPDATE_ERROR)
}

/** Marks all of the caller's unread notifications read in one statement. */
export async function markAllNotificationsRead(
  client: SupabaseClient,
  recipientId: string,
): Promise<void> {
  const { error } = await client
    .from(NOTIFICATIONS_TABLE)
    .update({ is_read: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false)

  if (error) throw new Error(NOTIFICATION_UPDATE_ERROR)
}
