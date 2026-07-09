import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

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
    updated_at: null,
    deleted_at: null,
  }
}

function createClient(rowCount: number) {
  const filters: { statusIn?: string[] } = {}
  const range = vi.fn()

  function deliveriesBuilder() {
    const b = {
      select: () => b,
      in: (_col: string, vals: string[]) => {
        filters.statusIn = vals
        return b
      },
      is: () => b,
      order: () => b,
      range: (from: number, to: number) => {
        range(from, to)
        const data = Array.from({ length: rowCount }, (_, i) =>
          historyRow(
            i + 1,
            i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'failed' : 'cancelled',
          ),
        )
        return Promise.resolve({ data, error: null })
      },
    }
    return b
  }

  function itemsBuilder() {
    return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) }
  }

  const from = vi.fn((table: string) =>
    table === 'deliveries' ? deliveriesBuilder() : itemsBuilder(),
  )

  return { client: { from } as unknown as SupabaseClient, range, filters }
}

describe('getDeliveryHistory', () => {
  it('reads terminal rows, paginated with a probe row', async () => {
    const { client, range, filters } = createClient(4)

    const page = await getDeliveryHistory(client, 0, 3)

    expect(filters.statusIn).toEqual(['completed', 'failed', 'cancelled'])
    expect(range).toHaveBeenCalledWith(0, 3)
    expect(page.hasNext).toBe(true)
    expect(page.deliveries).toHaveLength(3)
  })

  it('offsets later pages and reports no next page when the probe is absent', async () => {
    const { client, range } = createClient(2)

    const page = await getDeliveryHistory(client, 1, 3)

    expect(range).toHaveBeenCalledWith(3, 6)
    expect(page.hasNext).toBe(false)
    expect(page.deliveries).toHaveLength(2)
  })
})
