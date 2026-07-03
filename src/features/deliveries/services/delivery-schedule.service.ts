import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_TABLE,
  DELIVERY_COLUMNS,
  DELIVERY_ITEMS_TABLE,
  DELIVERY_SAVE_ERROR,
  DELIVERY_SCHEDULE_COLUMNS,
  DELIVERY_SCHEDULE_DATES_TABLE,
  DELIVERY_SCHEDULE_ITEMS_TABLE,
  DELIVERY_SCHEDULES_TABLE,
  MATERIALIZE_HORIZON_DAYS,
  ORG_USER_COLUMNS,
  USERS_TABLE,
} from '../deliveries.constants'
import {
  toCustomDateDeliveryInsertRows,
  toCustomDatesScheduleInsertRow,
  toDeliveryItemInsertRows,
  toOrgUser,
  toRecurringRouteScheduleInsertRow,
  toScheduleDateInsertRows,
  toScheduleItemInsertRows,
  toWeeklyScheduleInsertRow,
} from '../deliveries.mapper'
import { deliveryScheduleRowSchema, orgUserRowSchema } from '../deliveries.schema'
import type {
  DeliveryOwner,
  DeliveryScheduleFormValues,
  DeliveryScheduleRow,
  OrgUser,
  UnifiedDeliveryFormValues,
} from '../deliveries.types'
import { materializeWeeklySchedule } from './delivery-materialize.service'

const orgUserRowsSchema = z.array(orgUserRowSchema)

export const ORG_USERS_LOAD_ERROR =
  'Unable to load your team. Please try again.'

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

/** Lists organization members for delivery assignment. */
export async function getOrgUsers(
  client: SupabaseClient,
  orgId: number,
): Promise<OrgUser[]> {
  const { data, error } = await client
    .from(USERS_TABLE)
    .select(ORG_USER_COLUMNS)
    .eq('org_id', orgId)

  if (error) {
    throw new Error(ORG_USERS_LOAD_ERROR)
  }

  return orgUserRowsSchema.parse(data ?? []).map(toOrgUser)
}

/**
 * Creates the HTML-baseline delivery plan. Recurring routes use the existing
 * rolling materialization path. Custom dates save explicit dates and create one
 * pending occurrence per selected date immediately.
 */
export async function createUnifiedDeliverySchedule(
  client: SupabaseClient,
  values: UnifiedDeliveryFormValues,
  owner: DeliveryOwner,
): Promise<DeliveryScheduleRow> {
  const schedule = await insertUnifiedSchedule(client, values, owner)

  const { error: itemsError } = await client
    .from(DELIVERY_SCHEDULE_ITEMS_TABLE)
    .insert(toScheduleItemInsertRows(schedule.id, values, owner))

  if (itemsError) throw new Error(DELIVERY_SAVE_ERROR)

  if (values.scheduleMode === 'recurring_route') {
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

  const { error: datesError } = await client
    .from(DELIVERY_SCHEDULE_DATES_TABLE)
    .insert(toScheduleDateInsertRows(schedule.id, values, owner))

  if (datesError) throw new Error(DELIVERY_SAVE_ERROR)

  const { data: deliveryRows, error: deliveryError } = await client
    .from(DELIVERIES_TABLE)
    .insert(toCustomDateDeliveryInsertRows(schedule.id, values, owner))
    .select(DELIVERY_COLUMNS)

  if (deliveryError) throw new Error(DELIVERY_SAVE_ERROR)

  const deliveries = (deliveryRows ?? []) as Array<{ id: number }>
  const deliveryItems = deliveries.flatMap((delivery) =>
    toDeliveryItemInsertRows(delivery.id, values, owner),
  )

  if (deliveryItems.length > 0) {
    const { error: deliveryItemsError } = await client
      .from(DELIVERY_ITEMS_TABLE)
      .insert(deliveryItems)

    if (deliveryItemsError) throw new Error(DELIVERY_SAVE_ERROR)
  }

  return schedule
}

async function insertUnifiedSchedule(
  client: SupabaseClient,
  values: UnifiedDeliveryFormValues,
  owner: DeliveryOwner,
): Promise<DeliveryScheduleRow> {
  if (values.scheduleMode === 'recurring_route') {
    const { data, error } = await client
      .from(DELIVERY_SCHEDULES_TABLE)
      .insert(toRecurringRouteScheduleInsertRow(values, owner))
      .select(DELIVERY_SCHEDULE_COLUMNS)
      .single()

    if (error) throw new Error(DELIVERY_SAVE_ERROR)

    return deliveryScheduleRowSchema.parse(data)
  }

  const { data, error } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .insert(toCustomDatesScheduleInsertRow(values, owner))
    .select(DELIVERY_SCHEDULE_COLUMNS)
    .single()

  if (error) throw new Error(DELIVERY_SAVE_ERROR)

  return deliveryScheduleRowSchema.parse(data)
}
