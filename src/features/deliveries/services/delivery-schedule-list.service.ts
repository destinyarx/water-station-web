import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERY_SCHEDULE_COLUMNS,
  DELIVERY_SCHEDULES_TABLE,
} from '../deliveries.constants'
import type { DeliveryScheduleFilters } from '../deliveries.keys'
import { applyLimitPlusOne, DELIVERIES_PAGE_SIZE } from '../deliveries.pagination'
import { deliveryScheduleRowSchema } from '../deliveries.schema'
import type { DeliveryScheduleListItem } from '../deliveries.types'

const relatedCustomerSchema = z.object({
  name: z.string(),
  is_business: z.boolean(),
})

const scheduleListItemRowSchema = deliveryScheduleRowSchema.extend({
  customer: relatedCustomerSchema.nullable(),
  schedule_items: z.array(
    z.object({
      product_id: z.number().int(),
      quantity: z.coerce.number().positive(),
      is_stock_tracked: z.boolean(),
      product: z.object({ product_name: z.string() }).nullable(),
    }),
  ),
  current_delivery: z.array(
    z.object({
      delivery_date: z.string(),
      status: z.literal('pending'),
    }),
  ),
  next_delivery: z.array(
    z.object({
      delivery_date: z.string(),
      status: z.literal('pending'),
    }),
  ),
})

const scheduleListItemRowsSchema = z.array(scheduleListItemRowSchema)
const customerIdRowsSchema = z.array(z.object({ id: z.number().int() }))

export interface SchedulePage {
  schedules: DeliveryScheduleListItem[]
  hasNext: boolean
}

/**
 * Reads a bounded schedule page plus only the one Current and one Next pending
 * occurrence needed by the UI. Recipient search resolves matching customer IDs
 * first, then filters the bounded schedule query by customer ID or guest name.
 * Customer type filters use an inner relation; other queries retain guests.
 */
export async function getSchedules(
  client: SupabaseClient,
  filters: DeliveryScheduleFilters,
  pageSize: number = DELIVERIES_PAGE_SIZE,
  today: string = new Date().toISOString().slice(0, 10),
): Promise<SchedulePage> {
  const page = Math.max(0, filters.page)
  const offset = page * pageSize
  const search = filters.search.trim()
  const matchingCustomerIds =
    search === '' ? [] : await getMatchingCustomerIds(client, search)
  const filtersByCustomer = filters.customerType !== 'all'
  const customerRelation = filtersByCustomer
    ? 'customer:customers!inner(name,is_business)'
    : 'customer:customers(name,is_business)'

  let query = client
    .from(DELIVERY_SCHEDULES_TABLE)
    .select(
      `${DELIVERY_SCHEDULE_COLUMNS},${customerRelation},schedule_items:delivery_schedule_items(product_id,quantity,is_stock_tracked,product:products(product_name)),current_delivery:deliveries(delivery_date,status),next_delivery:deliveries(delivery_date,status)`,
    )
    .in('recurrence_type', ['weekly', 'monthly', 'custom_dates'])
    .is('deleted_at', null)
    // Finished plans leave the list. Only active schedules can be completed,
    // so a stopped schedule stays here and stays resumable.
    .eq('completed', false)
    .eq('current_delivery.status', 'pending')
    .lte('current_delivery.delivery_date', today)
    .eq('next_delivery.status', 'pending')
    .gt('next_delivery.delivery_date', today)
    .order('delivery_date', {
      ascending: false,
      referencedTable: 'current_delivery',
    })
    .limit(1, { referencedTable: 'current_delivery' })
    .order('delivery_date', {
      ascending: true,
      referencedTable: 'next_delivery',
    })
    .limit(1, { referencedTable: 'next_delivery' })

  if (filters.status === 'active') {
    query = query.eq('status', 'active')
  } else if (filters.status === 'inactive') {
    query = query.in('status', ['paused', 'ended'])
  }

  if (search !== '') {
    query = query.or(recipientSearchFilter(search, matchingCustomerIds))
  }

  if (filters.customerType !== 'all') {
    query = query.eq(
      'customer.is_business',
      filters.customerType === 'business',
    )
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(offset, offset + pageSize)

  if (error) throw new Error(DELIVERIES_LOAD_ERROR)

  const parsedRows = scheduleListItemRowsSchema.parse(data ?? [])
  const { rows, hasNext } = applyLimitPlusOne(parsedRows, pageSize)

  return {
    schedules: rows.map(toScheduleListItem),
    hasNext,
  }
}

async function getMatchingCustomerIds(
  client: SupabaseClient,
  search: string,
): Promise<number[]> {
  const { data, error } = await client
    .from('customers')
    .select('id')
    .is('deleted_at', null)
    .ilike('name', `%${search}%`)

  if (error) throw new Error(DELIVERIES_LOAD_ERROR)

  return customerIdRowsSchema.parse(data ?? []).map((customer) => customer.id)
}

function recipientSearchFilter(
  search: string,
  customerIds: number[],
): string {
  const guestNameFilter = `guest_name.ilike.${quotePostgrestValue(`%${search}%`)}`

  if (customerIds.length === 0) return guestNameFilter

  return `${guestNameFilter},customer_id.in.(${customerIds.join(',')})`
}

function quotePostgrestValue(value: string): string {
  const escapedValue = value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  return `"${escapedValue}"`
}

function toScheduleListItem(
  row: z.infer<typeof scheduleListItemRowSchema>,
): DeliveryScheduleListItem {
  const {
    customer,
    schedule_items: scheduleItems,
    current_delivery: currentDelivery,
    next_delivery: nextDelivery,
    ...schedule
  } = row

  return {
    schedule,
    customerName: customer?.name ?? null,
    customerIsBusiness: customer?.is_business ?? null,
    items: scheduleItems.map((item) => ({
      productId: item.product_id,
      productName: item.product?.product_name ?? 'Unavailable product',
      quantity: item.quantity,
      isStockTracked: item.is_stock_tracked,
    })),
    currentDeliveryDate: currentDelivery[0]?.delivery_date ?? null,
    nextDeliveryDate: nextDelivery[0]?.delivery_date ?? null,
  }
}
