import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { updateDeliveryOccurrence } from '../services/delivery-edit.service'
import type { DeliveryEditFormValues } from '../deliveries.types'

const owner = { orgId: '00000000-0000-4000-8000-000000000321', createdBy: 'user_123' }
const editedRow = {
  id: 77, schedule_id: 99, delivery_date: '2026-06-20', status: 'pending', failure_remarks: null,
  cancellation_remarks: null, notes: 'Updated note.', assigned_to: null, delivered_by: null, completed_at: null,
  org_id: owner.orgId, created_by: owner.createdBy, created_at: '2026-06-16T00:00:00.000Z', updated_at: null, deleted_at: null,
}
const itemRow = { id: 5, delivery_id: 77, product_id: 10, product_name: 'Bottle', unit_price: 30, quantity: 2, org_id: owner.orgId, created_at: '2026-06-18T00:00:00.000Z', updated_at: null }
const values: DeliveryEditFormValues = { deliveryDate: '2026-06-20', items: [{ productId: 10, productName: 'Bottle', quantity: 2, unitPrice: 30 }], notes: 'Updated note.' }

function createClient(rpcError = false) {
  const rpc = vi.fn(() => Promise.resolve({ data: null, error: rpcError ? { message: 'denied' } : null }))
  const from = vi.fn((table: string) => table === 'deliveries'
    ? { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: editedRow, error: null }) }) }) }
    : { select: () => ({ eq: () => Promise.resolve({ data: [itemRow], error: null }) }) })
  return { client: { rpc, from } as unknown as SupabaseClient, rpc }
}

describe('updateDeliveryOccurrence', () => {
  it('replaces the occurrence through one atomic RPC and refreshes it', async () => {
    const { client, rpc } = createClient()
    const delivery = await updateDeliveryOccurrence(client, 77, values)
    expect(rpc).toHaveBeenCalledWith('replace_delivery_items_atomic', {
      p_delivery_id: 77, p_delivery_date: '2026-06-20', p_notes: 'Updated note.',
      p_items: [{ product_id: 10, product_name: 'Bottle', unit_price: 30, quantity: 2 }],
    })
    expect(delivery.total).toBe(60)
  })

  it('maps RPC failures to the existing friendly error', async () => {
    const { client } = createClient(true)
    await expect(updateDeliveryOccurrence(client, 77, values)).rejects.toThrow('Unable to save delivery')
  })
})
