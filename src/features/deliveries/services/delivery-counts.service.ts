import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERIES_TABLE,
} from '../deliveries.constants'

export interface DeliveryQueueCounts {
  activeToday: number
  pendingBacklog: number
  completedToday: number
}

/** Shifts a `YYYY-MM-DD` date by whole days in UTC (no tz drift). */
function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

async function countRows(
  query: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  const { count, error } = await query
  if (error) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }
  return count ?? 0
}

/**
 * Three bounded `head: true` count queries for the queue cards. Each is
 * org-scoped under RLS and excludes soft-deleted rows. `today` is injectable so
 * the boundary is deterministic in tests.
 */
export async function getDeliveryQueueCounts(
  client: SupabaseClient,
  today: string = todayIso(),
): Promise<DeliveryQueueCounts> {
  const countOptions = { count: 'exact' as const, head: true }
  const base = () =>
    client.from(DELIVERIES_TABLE).select('id', countOptions).is('deleted_at', null)

  const [activeToday, pendingBacklog, completedToday] = await Promise.all([
    countRows(base().eq('status', 'pending').eq('delivery_date', today)),
    countRows(
      base()
        .eq('status', 'pending')
        .gte('delivery_date', addDays(today, -7))
        .lte('delivery_date', addDays(today, -1)),
    ),
    countRows(
      base()
        .eq('status', 'completed')
        .gte('completed_at', today)
        .lt('completed_at', addDays(today, 1)),
    ),
  ])

  return { activeToday, pendingBacklog, completedToday }
}
