import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { DELIVERIES_TABLE, DELIVERY_COLUMNS, DELIVERY_ITEM_COLUMNS, DELIVERY_ITEMS_TABLE } from '../deliveries.constants'
import { toDelivery } from '../deliveries.mapper'
import { deliveryItemRowSchema, deliveryRowSchema } from '../deliveries.schema'
import { resolveStatusTransition } from '../deliveries.transitions'
import type { Delivery, DeliveryStatus } from '../deliveries.types'

const deliveryItemRowsSchema = z.array(deliveryItemRowSchema)

export const DELIVERY_STATUS_ERROR = 'Unable to update delivery status. Please try again.'
export const ILLEGAL_TRANSITION_ERROR = 'That status change is not allowed.'
export const FAILURE_REMARKS_REQUIRED_ERROR = 'Add a reason for the failed delivery.'
export const CANCELLATION_REMARKS_REQUIRED_ERROR = 'Add a reason for cancelling the delivery.'

export interface StatusUpdateInput {
  deliveryId: number
  from: DeliveryStatus
  to: DeliveryStatus
  failureRemarks?: string | null
  cancellationRemarks?: string | null
}

export async function updateDeliveryStatus(client: SupabaseClient, input: StatusUpdateInput): Promise<Delivery> {
  const transition = resolveStatusTransition(input.from, input.to, [])
  if (!transition.legal) throw new Error(ILLEGAL_TRANSITION_ERROR)
  const failureRemarks = input.failureRemarks?.trim() ?? ''
  if (transition.failureRemarks === 'require' && !failureRemarks) throw new Error(FAILURE_REMARKS_REQUIRED_ERROR)
  const cancellationRemarks = input.cancellationRemarks?.trim() ?? ''
  if (transition.cancellationRemarks === 'require' && !cancellationRemarks) throw new Error(CANCELLATION_REMARKS_REQUIRED_ERROR)

  const { error } = await client.rpc('set_delivery_status_atomic', {
    p_delivery_id: input.deliveryId,
    p_expected_status: input.from,
    p_new_status: input.to,
    p_failure_remarks: failureRemarks || null,
    p_cancellation_remarks: cancellationRemarks || null,
  })
  if (error) throw new Error(DELIVERY_STATUS_ERROR)

  const { data, error: deliveryError } = await client.from(DELIVERIES_TABLE).select(DELIVERY_COLUMNS).eq('id', input.deliveryId).single()
  if (deliveryError) throw new Error(DELIVERY_STATUS_ERROR)
  const row = deliveryRowSchema.parse(data)
  const { data: itemData, error: itemError } = await client.from(DELIVERY_ITEMS_TABLE).select(DELIVERY_ITEM_COLUMNS).eq('delivery_id', input.deliveryId)
  if (itemError) throw new Error(DELIVERY_STATUS_ERROR)
  return toDelivery(row, deliveryItemRowsSchema.parse(itemData ?? []))
}
