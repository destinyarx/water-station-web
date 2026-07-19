import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  CURRENT_DELIVERIES_VIEW,
  CURRENT_DELIVERY_COLUMNS,
  DELIVERIES_LOAD_ERROR,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
  DELIVERY_SCHEDULES_TABLE,
} from '../deliveries.constants'
import { toDelivery } from '../deliveries.mapper'
import { applyLimitPlusOne, DELIVERIES_PAGE_SIZE } from '../deliveries.pagination'
import {
  currentDeliveryRowSchema,
  deliveryItemRowSchema,
  deliveryRecurrenceTypeSchema,
} from '../deliveries.schema'
import type { Delivery, DeliveryItemRow, DeliveryScheduleInfo } from '../deliveries.types'

const currentDeliveryRowsSchema = z.array(currentDeliveryRowSchema)
const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

const scheduleInfoRowSchema = z.object({
  id: z.number().int(),
  customer_id: z.number().int().nullable(),
  guest_name: z.string().nullable(),
  guest_contact: z.string().nullable(),
  guest_address: z.string().nullable(),
  recurrence_type: deliveryRecurrenceTypeSchema,
  weekdays: z.array(z.number().int()).nullable(),
  interval_weeks: z.number().int().nullable(),
})

const scheduleInfoRowsSchema = z.array(scheduleInfoRowSchema)

export interface CurrentQueuePage {
  deliveries: Delivery[]
  hasNext: boolean
}

export async function getCurrentDeliveries(
  client: SupabaseClient,
  page: number,
  pageSize: number = DELIVERIES_PAGE_SIZE,
): Promise<CurrentQueuePage> {
  const offset = page * pageSize
  const { data, error } = await client
    .from(CURRENT_DELIVERIES_VIEW)
    .select(CURRENT_DELIVERY_COLUMNS)
    .order('delivery_date', { ascending: true })
    .range(offset, offset + pageSize)

  if (error) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const { rows, hasNext } = applyLimitPlusOne(
    currentDeliveryRowsSchema.parse(data ?? []),
    pageSize,
  )

  if (rows.length === 0) {
    return { deliveries: [], hasNext }
  }

  const ids = rows.map((row) => row.id)
  const { data: itemData, error: itemError } = await client
    .from(DELIVERY_ITEMS_TABLE)
    .select(DELIVERY_ITEM_COLUMNS)
    .in('delivery_id', ids)

  if (itemError) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const itemRows = deliveryItemRowsSchema.parse(itemData ?? [])

  const scheduleIds = [...new Set(rows.map((row) => row.schedule_id))]
  const { data: schedData, error: schedError } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .select('id, customer_id, guest_name, guest_contact, guest_address, recurrence_type, weekdays, interval_weeks')
    .in('id', scheduleIds)

  if (schedError) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const scheduleRows = scheduleInfoRowsSchema.parse(schedData ?? [])
  const scheduleMap = new Map<number, DeliveryScheduleInfo>(
    scheduleRows.map((s) => [
      s.id,
      {
        customerId: s.customer_id,
        guestName: s.guest_name,
        guestContact: s.guest_contact,
        guestAddress: s.guest_address,
        recurrenceType: s.recurrence_type,
        weekdays: s.weekdays,
        intervalWeeks: s.interval_weeks,
      },
    ]),
  )

  const deliveries = rows.map((row) => ({
    ...toDelivery({ ...row, deleted_at: null }, itemsForDelivery(row.id, itemRows)),
    scheduleInfo: scheduleMap.get(row.schedule_id),
  }))

  return { deliveries, hasNext }
}

function itemsForDelivery(
  deliveryId: number,
  items: DeliveryItemRow[],
): DeliveryItemRow[] {
  return items.filter((item) => item.delivery_id === deliveryId)
}
