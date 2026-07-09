import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getCurrentDeliveries } from '../services/delivery-queue.service'

function viewRow(id: number) {
  return {
    id,
    schedule_id: 99,
    delivery_date: '2026-06-23',
    status: 'pending',
    failure_remarks: null,
    notes: null,
    delivered_by: null,
    completed_at: null,
    org_id: '00000000-0000-4000-8000-000000000321',
    created_by: 'user_123',
    created_at: '2026-06-16T00:00:00.000Z',
    updated_at: null,
    customer_id: null,
    guest_name: 'Aling Nena',
    recurrence_type: 'one_time',
    customer_name: null,
  }
}

function createClient(rowCount: number) {
  const range = vi.fn()

  function viewBuilder() {
    const b = {
      select: () => b,
      order: () => b,
      range: (from: number, to: number) => {
        range(from, to)
        const data = Array.from({ length: rowCount }, (_, i) => viewRow(i + 1))
        return Promise.resolve({ data, error: null })
      },
    }
    return b
  }

  function itemsBuilder() {
    return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) }
  }

  const from = vi.fn((table: string) =>
    table === 'v_current_deliveries' ? viewBuilder() : itemsBuilder(),
  )

  return { client: { from } as unknown as SupabaseClient, range }
}

describe('getCurrentDeliveries', () => {
  it('fetches pageSize + 1 rows and drops the probe when a next page exists', async () => {
    const { client, range } = createClient(4)

    const page = await getCurrentDeliveries(client, 0, 3)

    expect(range).toHaveBeenCalledWith(0, 3)
    expect(page.hasNext).toBe(true)
    expect(page.deliveries).toHaveLength(3)
  })

  it('offsets by page and reports no next page when the probe is absent', async () => {
    const { client, range } = createClient(2)

    const page = await getCurrentDeliveries(client, 2, 3)

    expect(range).toHaveBeenCalledWith(6, 9)
    expect(page.hasNext).toBe(false)
    expect(page.deliveries).toHaveLength(2)
  })
})
