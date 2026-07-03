import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getDeliveryQueueCounts } from '../services/delivery-counts.service'

interface Filters {
  table?: string
  status?: string
  inStatus?: string[]
  eqDate?: string
  gteDate?: string
  lteDate?: string
  gteCompleted?: string
  ltCompleted?: string
  recurrenceType?: string
}

function createClient() {
  const queries: Filters[] = []

  function builder(table: string) {
    const f: Filters = { table }
    queries.push(f)
    const b = {
      select: () => b,
      is: () => b,
      eq: (col: string, val: string) => {
        if (col === 'status') f.status = val
        if (col === 'delivery_date') f.eqDate = val
        if (col === 'recurrence_type') f.recurrenceType = val
        return b
      },
      in: (col: string, vals: string[]) => {
        if (col === 'status') f.inStatus = vals
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
        if (f.table === 'delivery_schedules') count = 2
        else if (f.status === 'completed') count = 3
        else if (f.status === 'for_delivery') count = 4
        else if (f.inStatus) count = 6
        else if (f.eqDate) count = 5
        else count = 7
        resolve({ count, error: null })
      },
    }
    return b
  }

  const from = vi.fn((table: string) => builder(table))
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
      forDelivery: 4,
      thisWeek: 6,
      activeWeeklySchedules: 2,
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
    // In progress: for_delivery status.
    expect(queries).toContainEqual(expect.objectContaining({ status: 'for_delivery' }))
    // This week: pending or for_delivery in [today, today+6].
    expect(queries).toContainEqual(
      expect.objectContaining({
        inStatus: ['pending', 'for_delivery'],
        gteDate: '2026-06-23',
        lteDate: '2026-06-29',
      }),
    )
    // Recurring: active weekly schedules.
    expect(queries).toContainEqual(
      expect.objectContaining({ table: 'delivery_schedules', recurrenceType: 'weekly', status: 'active' }),
    )
  })
})
