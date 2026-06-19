import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERIES_TABLE,
  DELIVERY_COLUMNS,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
  DELIVERY_SAVE_ERROR,
  DELIVERY_SCHEDULE_COLUMNS,
  DELIVERY_SCHEDULES_TABLE,
} from '../deliveries.constants'
import {
  toDelivery,
  toDeliveryInsertRow,
  toDeliveryItemInsertRows,
  toScheduleInsertRow,
} from '../deliveries.mapper'
import {
  deliveryItemRowSchema,
  deliveryRowSchema,
  deliveryScheduleRowSchema,
} from '../deliveries.schema'
import type {
  Delivery,
  DeliveryFormValues,
  DeliveryItemRow,
  DeliveryOwner,
} from '../deliveries.types'

const deliveryRowsSchema = z.array(deliveryRowSchema)
const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

export async function getActiveDeliveries(
  client: SupabaseClient,
): Promise<Delivery[]> {
  const { data, error } = await client
    .from(DELIVERIES_TABLE)
    .select(DELIVERY_COLUMNS)
    .is('deleted_at', null)
    .order('delivery_date', { ascending: true })

  if (error) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const deliveryRows = deliveryRowsSchema.parse(data ?? [])

  if (deliveryRows.length === 0) {
    return []
  }

  const deliveryIds = deliveryRows.map((delivery) => delivery.id)
  const { data: itemData, error: itemError } = await client
    .from(DELIVERY_ITEMS_TABLE)
    .select(DELIVERY_ITEM_COLUMNS)
    .in('delivery_id', deliveryIds)

  if (itemError) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const itemRows = deliveryItemRowsSchema.parse(itemData ?? [])
  return deliveryRows.map((delivery) =>
    toDelivery(delivery, itemsForDelivery(delivery.id, itemRows)),
  )
}

export async function createOneTimeDelivery(
  client: SupabaseClient,
  values: DeliveryFormValues,
  owner: DeliveryOwner,
): Promise<Delivery> {
  const { data: scheduleData, error: scheduleError } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .insert(toScheduleInsertRow(values, owner))
    .select(DELIVERY_SCHEDULE_COLUMNS)
    .single()

  if (scheduleError) {
    throw new Error(DELIVERY_SAVE_ERROR)
  }

  const schedule = deliveryScheduleRowSchema.parse(scheduleData)
  const { data: deliveryData, error: deliveryError } = await client
    .from(DELIVERIES_TABLE)
    .insert(toDeliveryInsertRow(schedule.id, values, owner))
    .select(DELIVERY_COLUMNS)
    .single()

  if (deliveryError) {
    throw new Error(DELIVERY_SAVE_ERROR)
  }

  const delivery = deliveryRowSchema.parse(deliveryData)
  const { data: itemData, error: itemError } = await client
    .from(DELIVERY_ITEMS_TABLE)
    .insert(toDeliveryItemInsertRows(delivery.id, values, owner))
    .select(DELIVERY_ITEM_COLUMNS)

  if (itemError) {
    throw new Error(DELIVERY_SAVE_ERROR)
  }

  return toDelivery(delivery, deliveryItemRowsSchema.parse(itemData ?? []))
}

function itemsForDelivery(
  deliveryId: number,
  items: DeliveryItemRow[],
): DeliveryItemRow[] {
  return items.filter((item) => item.delivery_id === deliveryId)
}
