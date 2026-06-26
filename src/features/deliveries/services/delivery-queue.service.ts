import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  CURRENT_DELIVERIES_VIEW,
  CURRENT_DELIVERY_COLUMNS,
  DELIVERIES_LOAD_ERROR,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
} from '../deliveries.constants'
import { toDelivery } from '../deliveries.mapper'
import { applyLimitPlusOne, DELIVERIES_PAGE_SIZE } from '../deliveries.pagination'
import {
  currentDeliveryRowSchema,
  deliveryItemRowSchema,
} from '../deliveries.schema'
import type { Delivery, DeliveryItemRow } from '../deliveries.types'

const currentDeliveryRowsSchema = z.array(currentDeliveryRowSchema)
const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

export interface CurrentQueuePage {
  deliveries: Delivery[]
  hasNext: boolean
}

/**
 * Reads one page of the current delivery queue from `v_current_deliveries`
 * (model B: overdue, due-today, and each schedule's nearest upcoming run).
 * Prev/next pagination uses `pageSize + 1` probing — no count query. The view is
 * `security_invoker`, so RLS scopes rows to the caller's org.
 */
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
  const deliveries = rows.map((row) =>
    toDelivery({ ...row, deleted_at: null }, itemsForDelivery(row.id, itemRows)),
  )

  return { deliveries, hasNext }
}

function itemsForDelivery(
  deliveryId: number,
  items: DeliveryItemRow[],
): DeliveryItemRow[] {
  return items.filter((item) => item.delivery_id === deliveryId)
}
