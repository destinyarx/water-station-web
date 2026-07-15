import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { updateDeliveryStatus } from '../services/delivery-status.service'

const baseDeliveryRow = {
  id: 77, schedule_id: 99, delivery_date: '2026-06-16', status: 'pending', failure_remarks: null,
  cancellation_remarks: null, notes: null, assigned_to: null, delivered_by: null, completed_at: null,
  org_id: '00000000-0000-4000-8000-000000000321', created_by: 'user_123',
  created_at: '2026-06-16T00:00:00.000Z', updated_at: null, deleted_at: null,
}
const itemRow = {
  id: 1, delivery_id: 77, product_id: 10, product_name: 'Bottle', unit_price: 30, quantity: 3,
  org_id: '00000000-0000-4000-8000-000000000321', created_at: '2026-06-16T00:00:00.000Z', updated_at: null,
}

function createClient(rpcError = false) {
  let deliveryRow: Record<string, unknown> = { ...baseDeliveryRow }
  const rpc = vi.fn((_name: string, args: Record<string, unknown>) => {
    deliveryRow = {
      ...deliveryRow,
      status: String(args.p_new_status),
      failure_remarks: typeof args.p_failure_remarks === 'string' ? args.p_failure_remarks : null,
      cancellation_remarks: typeof args.p_cancellation_remarks === 'string' ? args.p_cancellation_remarks : null,
    }
    return Promise.resolve({ data: null, error: rpcError ? { message: 'denied' } : null })
  })
  const from = vi.fn((table: string) => table === 'deliveries'
    ? { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: deliveryRow, error: null }) }) }) }
    : { select: () => ({ eq: () => Promise.resolve({ data: [itemRow], error: null }) }) })
  return { client: { rpc, from } as unknown as SupabaseClient, rpc }
}

describe('updateDeliveryStatus', () => {
  it('uses the atomic RPC and returns the refreshed delivery', async () => {
    const { client, rpc } = createClient()
    const delivery = await updateDeliveryStatus(client, { deliveryId: 77, from: 'pending', to: 'for_delivery' })
    expect(rpc).toHaveBeenCalledWith('set_delivery_status_atomic', expect.objectContaining({ p_delivery_id: 77, p_expected_status: 'pending', p_new_status: 'for_delivery' }))
    expect(delivery.status).toBe('for_delivery')
  })

  it('maps database failures to the friendly service error', async () => {
    const { client } = createClient(true)
    await expect(updateDeliveryStatus(client, { deliveryId: 77, from: 'pending', to: 'for_delivery' })).rejects.toThrow('Unable to update delivery status')
  })

  it('requires failure remarks before calling the RPC', async () => {
    const { client, rpc } = createClient()
    await expect(updateDeliveryStatus(client, { deliveryId: 77, from: 'for_delivery', to: 'failed', failureRemarks: '   ' })).rejects.toThrow(/reason/i)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('requires cancellation remarks before calling the RPC', async () => {
    const { client, rpc } = createClient()
    await expect(updateDeliveryStatus(client, { deliveryId: 77, from: 'pending', to: 'cancelled', cancellationRemarks: '' })).rejects.toThrow(/cancelling/i)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('rejects illegal transitions before calling the RPC', async () => {
    const { client, rpc } = createClient()
    await expect(updateDeliveryStatus(client, { deliveryId: 77, from: 'pending', to: 'completed' })).rejects.toThrow()
    expect(rpc).not.toHaveBeenCalled()
  })
})
