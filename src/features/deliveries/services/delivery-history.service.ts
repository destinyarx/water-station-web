import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERIES_TABLE,
  DELIVERY_COLUMNS,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
} from '../deliveries.constants'
import { toDelivery } from '../deliveries.mapper'
import { applyLimitPlusOne, DELIVERIES_PAGE_SIZE } from '../deliveries.pagination'
import { deliveryItemRowSchema, deliveryRowSchema } from '../deliveries.schema'
import type { Delivery, DeliveryItemRow } from '../deliveries.types'

const deliveryRowsSchema = z.array(deliveryRowSchema)
const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

export interface DeliveryHistoryPage {
  deliveries: Delivery[]
  hasNext: boolean
}

/**
 * Reads one page of finished deliveries (`completed` + `failed`), most-recent
 * first. Same prev/next probing as the current queue. Org-scoped under RLS;
 * soft-deleted rows excluded.
 */
export async function getDeliveryHistory(
  client: SupabaseClient,
  page: number,
  pageSize: number = DELIVERIES_PAGE_SIZE,
): Promise<DeliveryHistoryPage> {
  const offset = page * pageSize
  const { data, error } = await client
    .from(DELIVERIES_TABLE)
    .select(DELIVERY_COLUMNS)
    .in('status', ['completed', 'failed'])
    .is('deleted_at', null)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('delivery_date', { ascending: false })
    .range(offset, offset + pageSize)

  if (error) {
    throw new Error(DELIVERIES_LOAD_ERROR)
  }

  const { rows, hasNext } = applyLimitPlusOne(
    deliveryRowsSchema.parse(data ?? []),
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
    toDelivery(row, itemsForDelivery(row.id, itemRows)),
  )

  return { deliveries, hasNext }
}

function itemsForDelivery(
  deliveryId: number,
  items: DeliveryItemRow[],
): DeliveryItemRow[] {
  return items.filter((item) => item.delivery_id === deliveryId)
}
