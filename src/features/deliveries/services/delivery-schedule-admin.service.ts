import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_TABLE,
  DELIVERY_NOT_PERMITTED_ERROR,
  DELIVERY_SAVE_ERROR,
  DELIVERY_SCHEDULES_TABLE,
  MATERIALIZE_HORIZON_DAYS,
} from '../deliveries.constants'
import type { DeliveryOwner, DeliveryScheduleRow } from '../deliveries.types'
import { materializeRecurringSchedule } from './delivery-materialize.service'

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

  const { data: scheduleRows, error: scheduleError } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .update({ status: 'paused' })
    .eq('id', scheduleId)
    .select('id')

  if (scheduleError) throw new Error(DELIVERY_SAVE_ERROR)
  // Must throw before archiving occurrences: a refused pause that still deleted
  // them would strip the queue from a schedule that is still active.
  if (!scheduleRows?.length) throw new Error(DELIVERY_NOT_PERMITTED_ERROR)

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
  const { data, error } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .update({ status: 'active' })
    .eq('id', schedule.id)
    .select('id')

  if (error) throw new Error(DELIVERY_SAVE_ERROR)
  // Must throw before materializing: a refused resume that still generated
  // occurrences would fill the queue for a schedule that is still paused.
  if (!data?.length) throw new Error(DELIVERY_NOT_PERMITTED_ERROR)

  await materializeRecurringSchedule(
    client,
    schedule,
    owner,
    today,
    addDays(today, MATERIALIZE_HORIZON_DAYS),
  )
}
