import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_TABLE,
  DELIVERY_SAVE_ERROR,
  DELIVERY_SCHEDULES_TABLE,
  MATERIALIZE_HORIZON_DAYS,
} from '../deliveries.constants'
import type { DeliveryOwner, DeliveryScheduleRow } from '../deliveries.types'
import { materializeWeeklySchedule } from './delivery-materialize.service'

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Stops a standing order: marks the schedule `paused` and soft-deletes its own
 * `pending` occurrences dated on/after `today`. Overdue pending (`< today`),
 * `for_delivery` runs, and all terminal history are left untouched.
 */
export async function pauseSchedule(
  client: SupabaseClient,
  scheduleId: number,
  today: string,
): Promise<void> {
  const now = new Date().toISOString()

  const { error: scheduleError } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .update({ status: 'paused', updated_at: now })
    .eq('id', scheduleId)

  if (scheduleError) throw new Error(DELIVERY_SAVE_ERROR)

  const { error: occurrenceError } = await client
    .from(DELIVERIES_TABLE)
    .update({ deleted_at: now })
    .eq('schedule_id', scheduleId)
    .eq('status', 'pending')
    .gte('delivery_date', today)
    .is('deleted_at', null)

  if (occurrenceError) throw new Error(DELIVERY_SAVE_ERROR)
}

/**
 * Resumes a paused schedule: marks it `active` and tops up materialization
 * forward from `today`. The generator is anchored to `start_date`, so the paused
 * gap is not back-filled — only the rolling horizon ahead is filled.
 */
export async function resumeSchedule(
  client: SupabaseClient,
  schedule: DeliveryScheduleRow,
  owner: DeliveryOwner,
  today: string,
): Promise<void> {
  const { error } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', schedule.id)

  if (error) throw new Error(DELIVERY_SAVE_ERROR)

  await materializeWeeklySchedule(
    client,
    schedule,
    owner,
    today,
    addDays(today, MATERIALIZE_HORIZON_DAYS),
  )
}
