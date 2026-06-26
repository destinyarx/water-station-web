import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_TABLE,
  DELIVERY_ITEMS_TABLE,
  DELIVERY_SAVE_ERROR,
  DELIVERY_SCHEDULE_ITEMS_TABLE,
} from '../deliveries.constants'
import { PRODUCTS_TABLE } from '@/features/products/products.constants'
import { dueDatesFor, toRecurrenceRule } from '../deliveries.recurrence'
import type {
  DeliveryInsert,
  DeliveryItemInsert,
  DeliveryOwner,
  DeliveryScheduleRow,
} from '../deliveries.types'

interface TemplateItemRow {
  product_id: number
  quantity: number
  unit_price: number | null
}

interface ProductRow {
  id: number
  product_name: string
  price: number
}

/**
 * Client-triggered, idempotent top-up: materializes any missing `pending`
 * occurrences for a weekly schedule within `[fromDate, horizon]`, copying the
 * schedule's template items into each occurrence. Existing dates are read first
 * and skipped; the unique `(schedule_id, delivery_date)` index is the real
 * idempotency guard, so a racing re-run is safe. Returns how many occurrences
 * were created.
 */
export async function materializeWeeklySchedule(
  client: SupabaseClient,
  schedule: DeliveryScheduleRow,
  owner: DeliveryOwner,
  fromDate: string,
  horizon: string,
): Promise<number> {
  const dueDates = dueDatesFor(toRecurrenceRule(schedule), fromDate, horizon)
  if (dueDates.length === 0) return 0

  const { data: existing, error } = await client
    .from(DELIVERIES_TABLE)
    .select('delivery_date')
    .eq('schedule_id', schedule.id)
    .is('deleted_at', null)
    .gte('delivery_date', fromDate)
    .lte('delivery_date', horizon)

  if (error) throw new Error(DELIVERY_SAVE_ERROR)

  const existingDates = new Set(
    (existing ?? []).map((row) => (row as { delivery_date: string }).delivery_date),
  )
  const missing = dueDates.filter((date) => !existingDates.has(date))
  if (missing.length === 0) return 0

  // Resolve the template lines once; each occurrence snapshots name + price.
  const { data: templateItems, error: templateError } = await client
    .from(DELIVERY_SCHEDULE_ITEMS_TABLE)
    .select('product_id, quantity, unit_price')
    .eq('schedule_id', schedule.id)

  if (templateError) throw new Error(DELIVERY_SAVE_ERROR)

  const template = (templateItems ?? []) as TemplateItemRow[]
  const productIds = [...new Set(template.map((item) => item.product_id))]

  const productById = new Map<number, ProductRow>()
  if (productIds.length > 0) {
    const { data: productRows, error: productsError } = await client
      .from(PRODUCTS_TABLE)
      .select('id, product_name, price')
      .in('id', productIds)

    if (productsError) throw new Error(DELIVERY_SAVE_ERROR)
    for (const product of (productRows ?? []) as ProductRow[]) {
      productById.set(product.id, product)
    }
  }

  const itemRows: DeliveryItemInsert[] = []
  for (const date of missing) {
    const insert: DeliveryInsert = {
      schedule_id: schedule.id,
      delivery_date: date,
      status: 'pending',
      notes: schedule.notes,
      org_id: owner.orgId,
      created_by: owner.createdBy,
    }

    const { data: created, error: deliveryError } = await client
      .from(DELIVERIES_TABLE)
      .insert(insert)
      .select('id')
      .single()

    if (deliveryError || !created) throw new Error(DELIVERY_SAVE_ERROR)

    const deliveryId = (created as { id: number }).id
    for (const line of template) {
      const product = productById.get(line.product_id)
      itemRows.push({
        delivery_id: deliveryId,
        product_id: line.product_id,
        product_name: product?.product_name ?? '',
        quantity: line.quantity,
        // ponytail: template override wins; fall back to current product price.
        unit_price: line.unit_price ?? product?.price ?? 0,
        org_id: owner.orgId,
      })
    }
  }

  if (itemRows.length > 0) {
    const { error: itemsError } = await client
      .from(DELIVERY_ITEMS_TABLE)
      .insert(itemRows)
    if (itemsError) throw new Error(DELIVERY_SAVE_ERROR)
  }

  return missing.length
}
