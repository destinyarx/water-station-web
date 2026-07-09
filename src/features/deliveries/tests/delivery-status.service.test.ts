import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { updateDeliveryStatus } from '../services/delivery-status.service'
import type { StatusTransitionItem } from '../deliveries.transitions'

const baseDeliveryRow = {
  id: 77,
  schedule_id: 99,
  delivery_date: '2026-06-16',
  status: 'pending',
  failure_remarks: null,
  cancellation_remarks: null,
  notes: null,
  assigned_to: null,
  delivered_by: null,
  completed_at: null,
  org_id: '00000000-0000-4000-8000-000000000321',
  created_by: 'user_123',
  created_at: '2026-06-16T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

const itemRow = {
  id: 1,
  delivery_id: 77,
  product_id: 10,
  product_name: 'Bottle',
  unit_price: 30,
  quantity: 3,
  org_id: '00000000-0000-4000-8000-000000000321',
  created_at: '2026-06-16T00:00:00.000Z',
  updated_at: null,
}

const trackedItems: StatusTransitionItem[] = [
  { productId: 10, productName: 'Bottle', quantity: 3, isStockTracked: true },
]

interface ProductState {
  stock: number
  deleted?: boolean
}

function createClient(opts: {
  products?: Record<number, ProductState>
  deliveryUpdateError?: boolean
}) {
  const products = opts.products ?? {}
  const deliveryUpdate = vi.fn()

  function productsBuilder() {
    let updating = false
    let id: number | undefined
    let casStock: number | undefined
    let patch: { stock: number } | undefined
    const b = {
      select: (_cols: string) => {
        if (!updating) return b
        const p = id != null ? products[id] : undefined
        if (!p || p.stock !== casStock || patch == null) {
          return Promise.resolve({ data: [], error: null })
        }
        p.stock = patch.stock
        return Promise.resolve({ data: [{ id }], error: null })
      },
      update: (p: { stock: number }) => {
        updating = true
        patch = p
        return b
      },
      eq: (col: string, val: number) => {
        if (col === 'id') id = val
        if (col === 'stock') casStock = val
        return b
      },
      is: () => b,
      single: () => {
        const p = id != null ? products[id] : undefined
        if (!p || p.deleted) {
          return Promise.resolve({ data: null, error: { message: 'no row' } })
        }
        return Promise.resolve({ data: { stock: p.stock }, error: null })
      },
    }
    return b
  }

  function deliveriesBuilder() {
    let patch: Record<string, unknown> = {}
    const b = {
      update: (p: Record<string, unknown>) => {
        patch = p
        deliveryUpdate(p)
        return b
      },
      eq: () => b,
      is: () => b,
      select: () => b,
      single: () =>
        Promise.resolve(
          opts.deliveryUpdateError
            ? { data: null, error: { message: 'denied' } }
            : { data: { ...baseDeliveryRow, ...patch }, error: null },
        ),
    }
    return b
  }

  function itemsBuilder() {
    return {
      select: () => ({ eq: () => Promise.resolve({ data: [itemRow], error: null }) }),
    }
  }

  const from = vi.fn((table: string) => {
    if (table === 'products') return productsBuilder()
    if (table === 'deliveries') return deliveriesBuilder()
    return itemsBuilder()
  })

  const client = { from } as unknown as SupabaseClient
  return { client, products, deliveryUpdate }
}

describe('updateDeliveryStatus', () => {
  it('deducts tracked stock and stamps delivered_by on dispatch', async () => {
    const { client, products } = createClient({ products: { 10: { stock: 5 } } })

    const delivery = await updateDeliveryStatus(client, {
      deliveryId: 77,
      from: 'pending',
      to: 'for_delivery',
      items: trackedItems,
      deliveredBy: 'user_abc',
    })

    expect(products[10].stock).toBe(2)
    expect(delivery.status).toBe('for_delivery')
    expect(delivery.deliveredBy).toBe('user_abc')
  })

  it('rejects a dispatch that would go negative without writing the delivery', async () => {
    const { client, products, deliveryUpdate } = createClient({
      products: { 10: { stock: 2 } },
    })

    await expect(
      updateDeliveryStatus(client, {
        deliveryId: 77,
        from: 'pending',
        to: 'for_delivery',
        items: trackedItems,
        deliveredBy: 'user_abc',
      }),
    ).rejects.toThrow(/not enough stock for bottle/i)

    expect(products[10].stock).toBe(2)
    expect(deliveryUpdate).not.toHaveBeenCalled()
  })

  it('stamps completed_at when completing a dispatched delivery', async () => {
    const { client } = createClient({ products: { 10: { stock: 5 } } })

    const delivery = await updateDeliveryStatus(client, {
      deliveryId: 77,
      from: 'for_delivery',
      to: 'completed',
      items: trackedItems,
      deliveredBy: 'user_abc',
    })

    expect(delivery.status).toBe('completed')
    expect(delivery.completedAt).not.toBeNull()
  })

  it('requires failure remarks when marking failed', async () => {
    const { client } = createClient({ products: { 10: { stock: 5 } } })

    await expect(
      updateDeliveryStatus(client, {
        deliveryId: 77,
        from: 'for_delivery',
        to: 'failed',
        items: trackedItems,
        deliveredBy: 'user_abc',
        failureRemarks: '   ',
      }),
    ).rejects.toThrow(/reason/i)
  })

  it('requires cancellation remarks when cancelling', async () => {
    const { client } = createClient({ products: { 10: { stock: 5 } } })

    await expect(
      updateDeliveryStatus(client, {
        deliveryId: 77,
        from: 'pending',
        to: 'cancelled',
        items: trackedItems,
        deliveredBy: 'user_abc',
        cancellationRemarks: '   ',
      }),
    ).rejects.toThrow(/cancelling/i)
  })

  it('restores tracked stock when cancelling a dispatched delivery', async () => {
    const { client, products } = createClient({ products: { 10: { stock: 2 } } })

    const delivery = await updateDeliveryStatus(client, {
      deliveryId: 77,
      from: 'for_delivery',
      to: 'cancelled',
      items: trackedItems,
      deliveredBy: 'user_abc',
      cancellationRemarks: 'Customer cancelled.',
    })

    expect(products[10].stock).toBe(5)
    expect(delivery.status).toBe('cancelled')
    expect(delivery.cancellationRemarks).toBe('Customer cancelled.')
  })

  it('rejects an illegal transition', async () => {
    const { client, deliveryUpdate } = createClient({
      products: { 10: { stock: 5 } },
    })

    await expect(
      updateDeliveryStatus(client, {
        deliveryId: 77,
        from: 'pending',
        to: 'completed',
        items: trackedItems,
        deliveredBy: 'user_abc',
      }),
    ).rejects.toThrow()

    expect(deliveryUpdate).not.toHaveBeenCalled()
  })
})
