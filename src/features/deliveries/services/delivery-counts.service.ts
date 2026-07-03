import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERIES_TABLE,
  DELIVERY_SCHEDULES_TABLE,
} from '../deliveries.constants'

export interface DeliveryQueueCounts {
  activeToday: number
  pendingBacklog: number
  completedToday: number
  forDelivery: number
  thisWeek: number
  activeWeeklySchedules: number
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

export async function getDeliveryQueueCounts(
  client: SupabaseClient,
  today: string = todayIso(),
): Promise<DeliveryQueueCounts> {
  const countOptions = { count: 'exact' as const, head: true }
  const base = () =>
    client.from(DELIVERIES_TABLE).select('id', countOptions).is('deleted_at', null)

  const [activeToday, pendingBacklog, completedToday, forDelivery, thisWeek, activeWeeklySchedules] =
    await Promise.all([
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
      countRows(base().eq('status', 'for_delivery')),
      countRows(
        base()
          .in('status', ['pending', 'for_delivery'])
          .gte('delivery_date', today)
          .lte('delivery_date', addDays(today, 6)),
      ),
      countRows(
        client
          .from(DELIVERY_SCHEDULES_TABLE)
          .select('id', countOptions)
          .eq('recurrence_type', 'weekly')
          .eq('status', 'active')
          .is('deleted_at', null),
      ),
    ])

  return { activeToday, pendingBacklog, completedToday, forDelivery, thisWeek, activeWeeklySchedules }
}
