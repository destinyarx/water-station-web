import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_TABLE,
  DELIVERY_COLUMNS,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
  DELIVERY_SAVE_ERROR,
} from '../deliveries.constants'
import { toDelivery, toDeliveryItemInsertRows } from '../deliveries.mapper'
import { deliveryItemRowSchema, deliveryRowSchema } from '../deliveries.schema'
import type {
  Delivery,
  DeliveryEditFormValues,
  DeliveryOwner,
} from '../deliveries.types'

const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

/**
 * Edits a `pending` delivery occurrence: its date, notes, and line items.
 * Items are replaced wholesale (delete-then-insert) since a station edit is a
 * fresh basket, not a diff. Caller gates this on `pending` (the only editable
 * state per ADR 0003); status/stock are untouched here.
 *
 * ponytail: not a transaction — a delete that succeeds then a failed insert
 * leaves the row item-less. Move to a `replace_delivery_items` RPC if that
 * window ever bites. Edit also never rewrites `delivery_schedules`.
 */
export async function updateDeliveryOccurrence(
  client: SupabaseClient,
  deliveryId: number,
  values: DeliveryEditFormValues,
  owner: DeliveryOwner,
): Promise<Delivery> {
  const { data: deliveryData, error: deliveryError } = await client
    .from(DELIVERIES_TABLE)
    .update({
      delivery_date: values.deliveryDate,
      notes: values.notes?.trim() ? values.notes.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', deliveryId)
    .is('deleted_at', null)
    .select(DELIVERY_COLUMNS)
    .single()

  if (deliveryError) {
    throw new Error(DELIVERY_SAVE_ERROR)
  }

  const row = deliveryRowSchema.parse(deliveryData)

  const { error: deleteError } = await client
    .from(DELIVERY_ITEMS_TABLE)
    .delete()
    .eq('delivery_id', deliveryId)

  if (deleteError) {
    throw new Error(DELIVERY_SAVE_ERROR)
  }

  const { data: itemData, error: itemError } = await client
    .from(DELIVERY_ITEMS_TABLE)
    .insert(toDeliveryItemInsertRows(deliveryId, values, owner))
    .select(DELIVERY_ITEM_COLUMNS)

  if (itemError) {
    throw new Error(DELIVERY_SAVE_ERROR)
  }

  return toDelivery(row, deliveryItemRowsSchema.parse(itemData ?? []))
}
