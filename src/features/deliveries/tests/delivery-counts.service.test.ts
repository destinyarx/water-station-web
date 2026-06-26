import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getDeliveryQueueCounts } from '../services/delivery-counts.service'

interface Filters {
  status?: string
  eqDate?: string
  gteDate?: string
  lteDate?: string
  gteCompleted?: string
  ltCompleted?: string
}

function createClient() {
  const queries: Filters[] = []

  function builder() {
    const f: Filters = {}
    queries.push(f)
    const b = {
      select: () => b,
      is: () => b,
      eq: (col: string, val: string) => {
        if (col === 'status') f.status = val
        if (col === 'delivery_date') f.eqDate = val
        return b
      },
      gte: (col: string, val: string) => {
        if (col === 'delivery_date') f.gteDate = val
        if (col === 'completed_at') f.gteCompleted = val
        return b
      },
      lte: (col: string, val: string) => {
        f.lteDate = val
        return b
      },
      lt: (col: string, val: string) => {
        f.ltCompleted = val
        return b
      },
      then: (resolve: (r: { count: number; error: null }) => void) => {
        let count = 0
        if (f.status === 'completed') count = 3
        else if (f.eqDate) count = 5
        else count = 7
        resolve({ count, error: null })
      },
    }
    return b
  }

  const from = vi.fn(() => builder())
  return { client: { from } as unknown as SupabaseClient, queries }
}

describe('getDeliveryQueueCounts', () => {
  it('returns today-scoped active, backlog, and completed counts', async () => {
    const { client, queries } = createClient()

    const counts = await getDeliveryQueueCounts(client, '2026-06-23')

    expect(counts).toEqual({
      activeToday: 5,
      pendingBacklog: 7,
      completedToday: 3,
    })

    // Active today: pending on today.
    expect(queries).toContainEqual(
      expect.objectContaining({ status: 'pending', eqDate: '2026-06-23' }),
    )
    // Backlog: pending in [today-7, today-1].
    expect(queries).toContainEqual(
      expect.objectContaining({
        status: 'pending',
        gteDate: '2026-06-16',
        lteDate: '2026-06-22',
      }),
    )
    // Completed today: completed_at within the day.
    expect(queries).toContainEqual(
      expect.objectContaining({
        status: 'completed',
        gteCompleted: '2026-06-23',
        ltCompleted: '2026-06-24',
      }),
    )
  })
})
