import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  createOneTimeDelivery,
  getActiveDeliveries,
} from '../services/deliveries.service'
import type { DeliveryFormValues } from '../deliveries.types'

interface QueryResult {
  data?: unknown
  error: { message: string } | null
}

const deliveryRow = {
  id: 77,
  schedule_id: 99,
  delivery_date: '2026-06-16',
  status: 'pending',
  failure_remarks: null,
  notes: 'Call before leaving.',
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
  product_name: '5 Gallon Water Refill',
  unit_price: 30,
  quantity: 3,
  is_stock_tracked: false,
  org_id: '00000000-0000-4000-8000-000000000321',
  created_at: '2026-06-16T00:00:00.000Z',
  updated_at: null,
}

const values: DeliveryFormValues = {
  targetType: 'guest',
  customerId: undefined,
  guestName: 'Aling Nena Store',
  guestContact: '09171234567',
  guestAddress: 'Purok 2',
  recurrenceType: 'one_time',
  deliveryDate: '2026-06-16',
  items: [
    {
      productId: 10,
      productName: '5 Gallon Water Refill',
      quantity: 3,
      unitPrice: 30,
      isStockTracked: false,
    },
  ],
  notes: 'Call before leaving.',
  assignedTo: '',
}

const owner = { orgId: '00000000-0000-4000-8000-000000000321', createdBy: 'user_123' }

function createListClient(deliveriesResult: QueryResult, itemsResult: QueryResult) {
  const order = vi.fn(() => Promise.resolve(deliveriesResult))
  const is = vi.fn(() => ({ order }))
  const deliveriesSelect = vi.fn(() => ({ is }))

  const inFilter = vi.fn(() => Promise.resolve(itemsResult))
  const itemsSelect = vi.fn(() => ({ in: inFilter }))

  const from = vi.fn((table: string) => {
    if (table === 'deliveries') {
      return { select: deliveriesSelect }
    }

    return { select: itemsSelect }
  })

  const client = { from } as unknown as SupabaseClient
  return { client, from, deliveriesSelect, is, order }
}

function createInsertClient(options?: { failAt?: 'schedule' | 'delivery' | 'items' }) {
  const scheduleSingle = vi.fn(() =>
    Promise.resolve(
      options?.failAt === 'schedule'
        ? { data: null, error: { message: 'permission denied' } }
        : {
            data: {
              id: 99,
              customer_id: null,
              guest_name: 'Aling Nena Store',
              guest_contact: '09171234567',
              guest_address: 'Purok 2',
              recurrence_type: 'one_time',
              start_date: null,
              delivery_date: '2026-06-16',
              weekdays: null,
              interval_weeks: null,
              day_of_month: null,
              interval_months: null,
              end_date: null,
              status: 'active',
              notes: 'Call before leaving.',
              assigned_to: null,
              org_id: '00000000-0000-4000-8000-000000000321',
              created_by: 'user_123',
              created_at: '2026-06-16T00:00:00.000Z',
              updated_at: null,
              deleted_at: null,
            },
            error: null,
          },
    ),
  )
  const scheduleSelect = vi.fn(() => ({ single: scheduleSingle }))
  const scheduleInsert = vi.fn(() => ({ select: scheduleSelect }))

  const deliverySingle = vi.fn(() =>
    Promise.resolve(
      options?.failAt === 'delivery'
        ? { data: null, error: { message: 'permission denied' } }
        : { data: deliveryRow, error: null },
    ),
  )
  const deliverySelect = vi.fn(() => ({ single: deliverySingle }))
  const deliveryInsert = vi.fn(() => ({ select: deliverySelect }))

  const itemsSelect = vi.fn(() =>
    Promise.resolve(
      options?.failAt === 'items'
        ? { data: null, error: { message: 'permission denied' } }
        : { data: [itemRow], error: null },
    ),
  )
  const itemsInsert = vi.fn(() => ({ select: itemsSelect }))

  const from = vi.fn((table: string) => {
    if (table === 'delivery_schedules') {
      return { insert: scheduleInsert }
    }

    if (table === 'deliveries') {
      return { insert: deliveryInsert }
    }

    return { insert: itemsInsert }
  })

  const client = { from } as unknown as SupabaseClient
  return { client, scheduleInsert, deliveryInsert, itemsInsert }
}

describe('getActiveDeliveries', () => {
  it('returns active deliveries with item snapshots and filters soft-deleted rows', async () => {
    const { client, is, order } = createListClient(
      { data: [deliveryRow], error: null },
      { data: [itemRow], error: null },
    )

    const deliveries = await getActiveDeliveries(client)

    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(order).toHaveBeenCalledWith('delivery_date', { ascending: true })
    expect(deliveries[0]).toMatchObject({
      id: 77,
      items: [{ productName: '5 Gallon Water Refill', unitPrice: 30 }],
      total: 90,
    })
  })

  it('throws a friendly error when the list query fails', async () => {
    const { client } = createListClient(
      { data: null, error: { message: 'permission denied' } },
      { data: [], error: null },
    )

    await expect(getActiveDeliveries(client)).rejects.toThrow(
      'Unable to load deliveries. Please try again.',
    )
  })
})

describe('createOneTimeDelivery', () => {
  it('creates one schedule, one pending occurrence, and item snapshots with owner fields', async () => {
    const { client, scheduleInsert, deliveryInsert, itemsInsert } =
      createInsertClient()

    const delivery = await createOneTimeDelivery(client, values, owner)

    expect(scheduleInsert).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: '00000000-0000-4000-8000-000000000321', created_by: 'user_123' }),
    )
    expect(deliveryInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        schedule_id: 99,
        status: 'pending',
        org_id: '00000000-0000-4000-8000-000000000321',
        created_by: 'user_123',
      }),
    )
    expect(itemsInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        delivery_id: 77,
        product_name: '5 Gallon Water Refill',
        unit_price: 30,
        is_stock_tracked: false,
        org_id: '00000000-0000-4000-8000-000000000321',
      }),
    ])
    expect(delivery).toMatchObject({ id: 77, status: 'pending', total: 90 })
  })

  it('throws a friendly error when any create step fails', async () => {
    const { client } = createInsertClient({ failAt: 'delivery' })

    await expect(createOneTimeDelivery(client, values, owner)).rejects.toThrow(
      'Unable to save delivery. Please try again.',
    )
  })
})
