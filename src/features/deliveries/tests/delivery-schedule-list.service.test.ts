import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import type { DeliveryScheduleFilters } from '../deliveries.keys'
import { getSchedules } from '../services/delivery-schedule-list.service'

const defaultFilters: DeliveryScheduleFilters = {
  page: 0,
  search: '',
  status: 'all',
  customerType: 'all',
}

function row(id: number) {
  return {
    id,
    customer_id: 7,
    guest_name: null,
    guest_contact: null,
    guest_address: null,
    recurrence_type: 'weekly',
    start_date: '2026-06-01',
    delivery_date: null,
    weekdays: [1, 4],
    interval_weeks: 1,
    day_of_month: null,
    interval_months: null,
    end_date: null,
    status: 'active',
    notes: null,
    assigned_to: null,
    org_id: '00000000-0000-4000-8000-000000000321',
    created_by: 'user_123',
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: null,
    deleted_at: null,
    customer: { name: 'Maria Santos', is_business: false },
    schedule_items: [
      {
        product_id: 12,
        quantity: 2,
        is_stock_tracked: false,
        product: { product_name: '5 Gallon Refill' },
      },
    ],
    current_delivery: [{ delivery_date: '2026-07-18', status: 'pending' }],
    next_delivery: [{ delivery_date: '2026-07-21', status: 'pending' }],
  }
}

function createClient(
  rows: ReturnType<typeof row>[],
  matchingCustomerIds: number[] = [],
) {
  const calls = {
    select: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    customerIlike: vi.fn(),
    or: vi.fn(),
    range: vi.fn(),
  }
  const scheduleBuilder = {
    select: (columns: string) => {
      calls.select(columns)
      return scheduleBuilder
    },
    in: () => scheduleBuilder,
    is: () => scheduleBuilder,
    eq: (column: string, value: unknown) => {
      calls.eq(column, value)
      return scheduleBuilder
    },
    lte: () => scheduleBuilder,
    gt: () => scheduleBuilder,
    ilike: (column: string, value: string) => {
      calls.ilike(column, value)
      return scheduleBuilder
    },
    or: (filters: string) => {
      calls.or(filters)
      return scheduleBuilder
    },
    order: () => scheduleBuilder,
    limit: () => scheduleBuilder,
    range: (from: number, to: number) => {
      calls.range(from, to)
      return Promise.resolve({ data: rows, error: null })
    },
  }

  const customerBuilder = {
    select: () => customerBuilder,
    is: () => customerBuilder,
    ilike: (column: string, value: string) => {
      calls.customerIlike(column, value)
      return Promise.resolve({
        data: matchingCustomerIds.map((id) => ({ id })),
        error: null,
      })
    },
  }

  return {
    client: {
      from: (table: string) =>
        table === 'customers' ? customerBuilder : scheduleBuilder,
    } as unknown as SupabaseClient,
    calls,
  }
}

describe('getSchedules', () => {
  it('returns a bounded page and maps customer, item, Current, and Next context', async () => {
    const { client, calls } = createClient([row(1), row(2), row(3)])

    const result = await getSchedules(client, defaultFilters, 2, '2026-07-18')

    expect(result.hasNext).toBe(true)
    expect(result.schedules.map((item) => item.schedule.id)).toEqual([1, 2])
    expect(result.schedules[0]).toMatchObject({
      customerName: 'Maria Santos',
      customerIsBusiness: false,
      currentDeliveryDate: '2026-07-18',
      nextDeliveryDate: '2026-07-21',
      items: [
        {
          productName: '5 Gallon Refill',
          quantity: 2,
          isStockTracked: false,
        },
      ],
    })
    expect(calls.range).toHaveBeenCalledWith(0, 2)
  })

  it('applies customer search, type, status, and later-page offset server-side', async () => {
    const { client, calls } = createClient([row(1)])

    const result = await getSchedules(
      client,
      {
        page: 1,
        search: 'Maria',
        status: 'inactive',
        customerType: 'household',
      },
      2,
      '2026-07-18',
    )

    expect(result.hasNext).toBe(false)
    expect(calls.select.mock.calls[0]?.[0]).toContain('customers!inner')
    expect(calls.customerIlike).toHaveBeenCalledWith('name', '%Maria%')
    expect(calls.or).toHaveBeenCalledWith('guest_name.ilike."%Maria%"')
    expect(calls.eq).toHaveBeenCalledWith('customer.is_business', false)
    expect(calls.range).toHaveBeenCalledWith(2, 4)
  })

  it('searches both customer names and guest recipient names', async () => {
    const { client, calls } = createClient([row(1)], [7, 12])

    await getSchedules(
      client,
      {
        page: 0,
        search: 'Harbor',
        status: 'all',
        customerType: 'all',
      },
      2,
      '2026-07-18',
    )

    expect(calls.customerIlike).toHaveBeenCalledWith('name', '%Harbor%')
    expect(calls.or).toHaveBeenCalledWith(
      'guest_name.ilike."%Harbor%",customer_id.in.(7,12)',
    )
    expect(calls.select.mock.calls[0]?.[0]).not.toContain('customers!inner')
  })
})
