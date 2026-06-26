import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { updateDeliveryOccurrence } from '../services/delivery-edit.service'
import type { DeliveryFormValues } from '../deliveries.types'

const owner = { orgId: 321, createdBy: 'user_123' }

const editedRow = {
  id: 77,
  schedule_id: 99,
  delivery_date: '2026-06-20',
  status: 'pending',
  failure_remarks: null,
  notes: 'Updated note.',
  delivered_by: null,
  completed_at: null,
  org_id: 321,
  created_by: 'user_123',
  created_at: '2026-06-16T00:00:00.000Z',
  updated_at: '2026-06-18T00:00:00.000Z',
  deleted_at: null,
}

const insertedItemRow = {
  id: 5,
  delivery_id: 77,
  product_id: 10,
  product_name: 'Bottle',
  unit_price: 30,
  quantity: 2,
  org_id: 321,
  created_at: '2026-06-18T00:00:00.000Z',
  updated_at: null,
}

const values: DeliveryFormValues = {
  targetType: 'guest',
  customerId: undefined,
  guestName: 'Aling Nena',
  guestContact: '09171234567',
  guestAddress: 'Purok 2',
  recurrenceType: 'one_time',
  deliveryDate: '2026-06-20',
  items: [{ productId: 10, productName: 'Bottle', quantity: 2, unitPrice: 30 }],
  notes: 'Updated note.',
}

function createClient() {
  const deleteItems = vi.fn()
  const insertItems = vi.fn()

  function deliveriesBuilder() {
    const b = {
      update: () => b,
      eq: () => b,
      is: () => b,
      select: () => b,
      single: () => Promise.resolve({ data: editedRow, error: null }),
    }
    return b
  }

  function itemsBuilder() {
    return {
      delete: () => ({
        eq: (_c: string, v: number) => {
          deleteItems(v)
          return Promise.resolve({ error: null })
        },
      }),
      insert: (rows: unknown) => {
        insertItems(rows)
        return {
          select: () => Promise.resolve({ data: [insertedItemRow], error: null }),
        }
      },
    }
  }

  const from = vi.fn((table: string) =>
    table === 'deliveries' ? deliveriesBuilder() : itemsBuilder(),
  )

  return {
    client: { from } as unknown as SupabaseClient,
    deleteItems,
    insertItems,
  }
}

describe('updateDeliveryOccurrence', () => {
  it('replaces items and returns the edited delivery', async () => {
    const { client, deleteItems, insertItems } = createClient()

    const delivery = await updateDeliveryOccurrence(client, 77, values, owner)

    expect(deleteItems).toHaveBeenCalledWith(77)
    expect(insertItems).toHaveBeenCalledWith([
      {
        delivery_id: 77,
        product_id: 10,
        product_name: 'Bottle',
        quantity: 2,
        unit_price: 30,
        org_id: 321,
      },
    ])
    expect(delivery.deliveryDate).toBe('2026-06-20')
    expect(delivery.notes).toBe('Updated note.')
    expect(delivery.total).toBe(60)
  })
})
