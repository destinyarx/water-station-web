import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERY_SAVE_ERROR,
  DELIVERY_SCHEDULE_COLUMNS,
  DELIVERY_SCHEDULE_ITEMS_TABLE,
  DELIVERY_SCHEDULES_TABLE,
  MATERIALIZE_HORIZON_DAYS,
} from '../deliveries.constants'
import {
  toScheduleItemInsertRows,
  toWeeklyScheduleInsertRow,
} from '../deliveries.mapper'
import { deliveryScheduleRowSchema } from '../deliveries.schema'
import type {
  DeliveryOwner,
  DeliveryScheduleFormValues,
  DeliveryScheduleRow,
} from '../deliveries.types'
import { materializeWeeklySchedule } from './delivery-materialize.service'

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Creates a weekly standing order: the schedule plan, its template lines, then
 * an initial rolling top-up of `pending` occurrences within the horizon. The
 * unique `(schedule_id, delivery_date)` index keeps the top-up idempotent.
 */
export async function createWeeklySchedule(
  client: SupabaseClient,
  values: DeliveryScheduleFormValues,
  owner: DeliveryOwner,
): Promise<DeliveryScheduleRow> {
  const { data: scheduleData, error: scheduleError } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .insert(toWeeklyScheduleInsertRow(values, owner))
    .select(DELIVERY_SCHEDULE_COLUMNS)
    .single()

  if (scheduleError) throw new Error(DELIVERY_SAVE_ERROR)

  const schedule = deliveryScheduleRowSchema.parse(scheduleData)

  const { error: itemsError } = await client
    .from(DELIVERY_SCHEDULE_ITEMS_TABLE)
    .insert(toScheduleItemInsertRows(schedule.id, values, owner))

  if (itemsError) throw new Error(DELIVERY_SAVE_ERROR)

  const today = todayIso()
  const fromDate = values.startDate > today ? values.startDate : today
  await materializeWeeklySchedule(
    client,
    schedule,
    owner,
    fromDate,
    addDays(today, MATERIALIZE_HORIZON_DAYS),
  )

  return schedule
}
