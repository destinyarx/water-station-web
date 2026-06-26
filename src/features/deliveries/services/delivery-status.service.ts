import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_TABLE,
  DELIVERY_COLUMNS,
  DELIVERY_ITEM_COLUMNS,
  DELIVERY_ITEMS_TABLE,
} from '../deliveries.constants'
import { toDelivery } from '../deliveries.mapper'
import { deliveryItemRowSchema, deliveryRowSchema } from '../deliveries.schema'
import {
  resolveStatusTransition,
  type StatusTransitionItem,
  type StockDelta,
} from '../deliveries.transitions'
import type { Delivery, DeliveryStatus } from '../deliveries.types'

const PRODUCTS_TABLE = 'products'
const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

export const DELIVERY_STATUS_ERROR =
  'Unable to update delivery status. Please try again.'
export const ILLEGAL_TRANSITION_ERROR = 'That status change is not allowed.'
export const FAILURE_REMARKS_REQUIRED_ERROR =
  'Add a reason for the failed delivery.'

export interface StatusUpdateInput {
  deliveryId: number
  from: DeliveryStatus
  to: DeliveryStatus
  items: StatusTransitionItem[]
  /** Clerk user id, stamped as `delivered_by` when entering `for_delivery`. */
  deliveredBy: string
  failureRemarks?: string | null
}

/**
 * Moves a delivery occurrence to a new status, keeping `products.stock` correct.
 * The transition decision (legality, stock direction, derived fields) comes from
 * the pure `resolveStatusTransition`; this service just applies it to Supabase.
 *
 * Stock movement is applied before the status write so a shortage blocks the
 * whole transition. `products.stock` is a plain integer column, so the deduct
 * guard is a read-check-compare-and-set via the SDK (the SDK cannot express
 * `set stock = stock - qty`). Negative stock is impossible: the value is checked
 * before every write.
 *
 * ponytail: optimistic compare-and-set, not a DB transaction. Multi-item
 * all-or-nothing is a compensating restore, not a real rollback. Add a Postgres
 * `adjust_stock(product_id, delta)` RPC if station concurrency ever rises.
 */
export async function updateDeliveryStatus(
  client: SupabaseClient,
  input: StatusUpdateInput,
): Promise<Delivery> {
  const transition = resolveStatusTransition(input.from, input.to, input.items)
  if (!transition.legal) {
    throw new Error(ILLEGAL_TRANSITION_ERROR)
  }

  const remarks = input.failureRemarks?.trim() ?? ''
  if (transition.failureRemarks === 'require' && remarks === '') {
    throw new Error(FAILURE_REMARKS_REQUIRED_ERROR)
  }

  await applyStockDeltas(client, transition.stockDeltas, input.items)

  const patch: Record<string, unknown> = {
    status: input.to,
    completed_at: transition.completedAt === 'set' ? new Date().toISOString() : null,
    failure_remarks: transition.failureRemarks === 'require' ? remarks : null,
    updated_at: new Date().toISOString(),
  }
  if (transition.stampDeliveredBy) {
    patch.delivered_by = input.deliveredBy
  }

  const { data, error } = await client
    .from(DELIVERIES_TABLE)
    .update(patch)
    .eq('id', input.deliveryId)
    .is('deleted_at', null)
    .select(DELIVERY_COLUMNS)
    .single()

  if (error) {
    // Best-effort: undo the stock we just moved so it doesn't drift.
    await applyStockDeltas(client, invert(transition.stockDeltas), input.items).catch(
      () => undefined,
    )
    throw new Error(DELIVERY_STATUS_ERROR)
  }

  const row = deliveryRowSchema.parse(data)
  const { data: itemData, error: itemError } = await client
    .from(DELIVERY_ITEMS_TABLE)
    .select(DELIVERY_ITEM_COLUMNS)
    .eq('delivery_id', row.id)

  if (itemError) {
    throw new Error(DELIVERY_STATUS_ERROR)
  }

  return toDelivery(row, deliveryItemRowsSchema.parse(itemData ?? []))
}

function invert(deltas: StockDelta[]): StockDelta[] {
  return deltas.map((delta) => ({ productId: delta.productId, delta: -delta.delta }))
}

async function applyStockDeltas(
  client: SupabaseClient,
  deltas: StockDelta[],
  items: StatusTransitionItem[],
): Promise<void> {
  if (deltas.length === 0) return

  const nameById = new Map(items.map((item) => [item.productId, item.productName]))
  const applied: StockDelta[] = []

  for (const delta of deltas) {
    try {
      await applyOneDelta(client, delta, nameById)
      applied.push(delta)
    } catch (error) {
      // Compensate the deltas already applied, then surface the failure.
      for (const done of applied) {
        await applyOneDelta(
          client,
          { productId: done.productId, delta: -done.delta },
          nameById,
        ).catch(() => undefined)
      }
      throw error
    }
  }
}

async function applyOneDelta(
  client: SupabaseClient,
  delta: StockDelta,
  nameById: Map<number, string>,
): Promise<void> {
  const { data: current, error } = await client
    .from(PRODUCTS_TABLE)
    .select('stock')
    .eq('id', delta.productId)
    .is('deleted_at', null)
    .single()

  if (error || !current) {
    throw new Error(DELIVERY_STATUS_ERROR)
  }

  const stock = (current as { stock: number }).stock
  const next = stock + delta.delta
  if (next < 0) {
    const name = nameById.get(delta.productId) ?? 'a product'
    throw new Error(`Not enough stock for ${name}.`)
  }

  const { data: updated, error: updateError } = await client
    .from(PRODUCTS_TABLE)
    .update({ stock: next })
    .eq('id', delta.productId)
    .eq('stock', stock)
    .select('id')

  if (updateError) {
    throw new Error(DELIVERY_STATUS_ERROR)
  }
  if (!updated || (updated as unknown[]).length === 0) {
    // Stock changed under us between read and write — treat as a conflict.
    throw new Error(DELIVERY_STATUS_ERROR)
  }
}
