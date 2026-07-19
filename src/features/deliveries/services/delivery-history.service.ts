import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERIES_TABLE,
  DELIVERY_COLUMNS,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
  DELIVERY_SCHEDULES_TABLE,
} from '../deliveries.constants'
import type { DeliveryHistoryFilters } from '../deliveries.keys'
import { toDelivery } from '../deliveries.mapper'
import { applyLimitPlusOne, DELIVERIES_PAGE_SIZE } from '../deliveries.pagination'
import {
  deliveryItemRowSchema,
  deliveryRecurrenceTypeSchema,
  deliveryRowSchema,
} from '../deliveries.schema'
import type {
  Delivery,
  DeliveryItemRow,
  DeliveryScheduleInfo,
} from '../deliveries.types'

const deliveryRowsSchema = z.array(deliveryRowSchema)
const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)
const scheduleContextRowsSchema = z.array(
  z.object({
    id: z.number().int(),
    customer_id: z.number().int().nullable(),
    guest_name: z.string().nullable(),
    guest_address: z.string().nullable(),
    recurrence_type: deliveryRecurrenceTypeSchema,
    weekdays: z.array(z.number().int()).nullable(),
    interval_weeks: z.number().int().nullable(),
  }),
)
const customerContextRowsSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
    is_business: z.boolean(),
  }),
)

export interface DeliveryHistoryPage {
  deliveries: Delivery[]
  hasNext: boolean
}

/**
 * Reads one bounded terminal-history page. `updated_at` is the shared terminal
 * event timestamp for completed, failed, and cancelled deliveries; the
 * remaining order clauses keep ties deterministic.
 */
export async function getDeliveryHistory(
  client: SupabaseClient,
  filters: DeliveryHistoryFilters,
  pageSize: number = DELIVERIES_PAGE_SIZE,
): Promise<DeliveryHistoryPage> {
  const page = Math.max(0, filters.page)
  const offset = page * pageSize
  const search = filters.search.trim()
  const deliverySelect =
    search === ''
      ? DELIVERY_COLUMNS
      : `${DELIVERY_COLUMNS},schedule:delivery_schedules!inner(customer:customers!inner(name))`
  let query = client
    .from(DELIVERIES_TABLE)
    .select(deliverySelect)
    .is('deleted_at', null)

  query =
    filters.status === 'all'
      ? query.in('status', ['completed', 'failed', 'cancelled'])
      : query.eq('status', filters.status)

  if (search !== '') {
    query = query.ilike('schedule.customer.name', `%${search}%`)
  }

  const { data, error } = await query
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('delivery_date', { ascending: false })
    .order('id', { ascending: false })
    .range(offset, offset + pageSize)

  if (error) throw new Error(DELIVERIES_LOAD_ERROR)

  const { rows, hasNext } = applyLimitPlusOne(
    deliveryRowsSchema.parse(data ?? []),
    pageSize,
  )

  if (rows.length === 0) return { deliveries: [], hasNext }

  const deliveryIds = rows.map((row) => row.id)
  const scheduleIds = [...new Set(rows.map((row) => row.schedule_id))]
  const [itemResult, scheduleResult] = await Promise.all([
    client
      .from(DELIVERY_ITEMS_TABLE)
      .select(DELIVERY_ITEM_COLUMNS)
      .in('delivery_id', deliveryIds),
    client
      .from(DELIVERY_SCHEDULES_TABLE)
      .select(
        'id, customer_id, guest_name, guest_address, recurrence_type, weekdays, interval_weeks',
      )
      .in('id', scheduleIds),
  ])

  if (itemResult.error || scheduleResult.error) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const itemRows = deliveryItemRowsSchema.parse(itemResult.data ?? [])
  const scheduleRows = scheduleContextRowsSchema.parse(scheduleResult.data ?? [])
  const customerIds = [
    ...new Set(
      scheduleRows.flatMap((schedule) =>
        schedule.customer_id == null ? [] : [schedule.customer_id],
      ),
    ),
  ]

  const customerRows = await getCustomerContext(client, customerIds)
  const customerMap = new Map(customerRows.map((customer) => [customer.id, customer]))
  const scheduleMap = new Map<number, DeliveryScheduleInfo>(
    scheduleRows.map((schedule) => {
      const customer =
        schedule.customer_id == null
          ? null
          : customerMap.get(schedule.customer_id) ?? null

      return [
        schedule.id,
        {
          customerId: schedule.customer_id,
          customerName: customer?.name ?? null,
          customerIsBusiness: customer?.is_business ?? null,
          guestName: schedule.guest_name,
          guestAddress: schedule.guest_address,
          recurrenceType: schedule.recurrence_type,
          weekdays: schedule.weekdays,
          intervalWeeks: schedule.interval_weeks,
        },
      ]
    }),
  )

  return {
    deliveries: rows.map((row) => ({
      ...toDelivery(row, itemsForDelivery(row.id, itemRows)),
      scheduleInfo: scheduleMap.get(row.schedule_id),
    })),
    hasNext,
  }
}

async function getCustomerContext(
  client: SupabaseClient,
  customerIds: number[],
): Promise<z.infer<typeof customerContextRowsSchema>> {
  if (customerIds.length === 0) return []

  const { data, error } = await client
    .from('customers')
    .select('id, name, is_business')
    .in('id', customerIds)

  if (error) throw new Error(DELIVERIES_LOAD_ERROR)
  return customerContextRowsSchema.parse(data ?? [])
}

function itemsForDelivery(
  deliveryId: number,
  items: DeliveryItemRow[],
): DeliveryItemRow[] {
  return items.filter((item) => item.delivery_id === deliveryId)
}
