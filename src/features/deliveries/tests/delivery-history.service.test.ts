import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { getDeliveryHistory } from '../services/delivery-history.service'

function historyRow(id: number, status: 'completed' | 'failed' | 'cancelled') {
  return {
    id,
    schedule_id: 99,
    delivery_date: '2026-06-20',
    status,
    failure_remarks: status === 'failed' ? 'No one home.' : null,
    cancellation_remarks: status === 'cancelled' ? 'Customer cancelled.' : null,
    notes: null,
    assigned_to: null,
    delivered_by: 'user_123',
    completed_at: status === 'completed' ? '2026-06-20T08:00:00.000Z' : null,
    org_id: '00000000-0000-4000-8000-000000000321',
    created_by: 'user_123',
    created_at: '2026-06-16T00:00:00.000Z',
    updated_at: '2026-06-20T08:00:00.000Z',
    deleted_at: null,
  }
}

function createClient(rowCount: number) {
  const calls = {
    statusIn: vi.fn(),
    statusEq: vi.fn(),
    range: vi.fn(),
    order: vi.fn(),
  }

  function deliveriesBuilder() {
    const builder = {
      select: () => builder,
      is: () => builder,
      in: (column: string, values: string[]) => {
        calls.statusIn(column, values)
        return builder
      },
      eq: (column: string, value: string) => {
        calls.statusEq(column, value)
        return builder
      },
      order: (column: string) => {
        calls.order(column)
        return builder
      },
      range: (from: number, to: number) => {
        calls.range(from, to)
        const statuses = ['completed', 'failed', 'cancelled'] as const
        return Promise.resolve({
          data: Array.from({ length: rowCount }, (_, index) =>
            historyRow(index + 1, statuses[index % statuses.length]),
          ),
          error: null,
        })
      },
    }
    return builder
  }

  function inResult(data: unknown[]) {
    return { select: () => ({ in: () => Promise.resolve({ data, error: null }) }) }
  }

  const from = vi.fn((table: string) => {
    if (table === 'deliveries') return deliveriesBuilder()
    if (table === 'delivery_items') return inResult([])
    if (table === 'delivery_schedules') {
      return inResult([
        {
          id: 99,
          customer_id: 7,
          guest_name: null,
          guest_address: null,
          recurrence_type: 'weekly',
          weekdays: [1, 4],
          interval_weeks: 1,
        },
      ])
    }
    return inResult([{ id: 7, name: 'Maria Santos', is_business: false }])
  })

  return { client: { from } as unknown as SupabaseClient, calls }
}

describe('getDeliveryHistory', () => {
  it('reads all terminal rows with a probe and orders by terminal update time', async () => {
    const { client, calls } = createClient(4)

    const page = await getDeliveryHistory(
      client,
      { page: 0, status: 'all' },
      3,
    )

    expect(calls.statusIn).toHaveBeenCalledWith('status', [
      'completed',
      'failed',
      'cancelled',
    ])
    expect(calls.order.mock.calls.map(([column]) => column)).toEqual([
      'updated_at',
      'completed_at',
      'delivery_date',
      'id',
    ])
    expect(calls.range).toHaveBeenCalledWith(0, 3)
    expect(page.hasNext).toBe(true)
    expect(page.deliveries).toHaveLength(3)
    expect(page.deliveries[0]?.scheduleInfo?.customerName).toBe('Maria Santos')
  })

  it('filters one terminal status and offsets later pages', async () => {
    const { client, calls } = createClient(2)

    const page = await getDeliveryHistory(
      client,
      { page: 1, status: 'cancelled' },
      3,
    )

    expect(calls.statusEq).toHaveBeenCalledWith('status', 'cancelled')
    expect(calls.range).toHaveBeenCalledWith(3, 6)
    expect(page.hasNext).toBe(false)
  })
})
