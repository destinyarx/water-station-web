import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { DELIVERIES_TABLE, DELIVERY_COLUMNS, DELIVERY_ITEM_COLUMNS, DELIVERY_ITEMS_TABLE, DELIVERY_SAVE_ERROR } from '../deliveries.constants'
import { toDelivery } from '../deliveries.mapper'
import { deliveryItemRowSchema, deliveryRowSchema } from '../deliveries.schema'
import type { Delivery, DeliveryEditFormValues } from '../deliveries.types'

const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

export async function updateDeliveryOccurrence(
  client: SupabaseClient,
  deliveryId: number,
  values: DeliveryEditFormValues,
): Promise<Delivery> {
  const { error } = await client.rpc('replace_delivery_items_atomic', {
    p_delivery_id: deliveryId,
    p_delivery_date: values.deliveryDate,
    p_notes: values.notes?.trim() || null,
    p_items: values.items.map((item) => ({
      product_id: item.productId,
      product_name: item.productName.trim(),
      unit_price: item.unitPrice,
      quantity: item.quantity,
    })),
  })
  if (error) throw new Error(DELIVERY_SAVE_ERROR)

  const { data, error: deliveryError } = await client.from(DELIVERIES_TABLE).select(DELIVERY_COLUMNS).eq('id', deliveryId).single()
  if (deliveryError) throw new Error(DELIVERY_SAVE_ERROR)
  const row = deliveryRowSchema.parse(data)
  const { data: itemData, error: itemError } = await client.from(DELIVERY_ITEMS_TABLE).select(DELIVERY_ITEM_COLUMNS).eq('delivery_id', deliveryId)
  if (itemError) throw new Error(DELIVERY_SAVE_ERROR)
  return toDelivery(row, deliveryItemRowsSchema.parse(itemData ?? []))
}
