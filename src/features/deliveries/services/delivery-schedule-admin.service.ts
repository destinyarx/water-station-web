import type { SupabaseClient } from '@supabase/supabase-js'

import {
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
  const { error } = await client.rpc('pause_delivery_schedule_atomic', {
    p_schedule_id: scheduleId,
    p_today: today,
  })

  if (error) throw new Error(DELIVERY_SAVE_ERROR)
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
