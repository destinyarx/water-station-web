import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getSchedules } from '../services/delivery-schedule-list.service'
import type { DeliveryScheduleRow } from '../deliveries.types'

function row(id: number): DeliveryScheduleRow {
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
    org_id: 321,
    created_by: 'user_123',
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: null,
    deleted_at: null,
  }
}

function createClient(rows: DeliveryScheduleRow[]) {
  const range = vi.fn(() => Promise.resolve({ data: rows, error: null }))
  const builder = {
    select: () => builder,
    in: () => builder,
    is: () => builder,
    order: () => builder,
    range,
  }
  return { client: { from: () => builder } as unknown as SupabaseClient, range }
}

describe('getSchedules', () => {
  it('returns one page and flags more when the probe row is present', async () => {
    // pageSize 2 + 1 probe row = 3 returned.
    const { client, range } = createClient([row(1), row(2), row(3)])

    const result = await getSchedules(client, 0, 2)

    expect(result.hasNext).toBe(true)
    expect(result.schedules.map((s) => s.id)).toEqual([1, 2])
    expect(range).toHaveBeenCalledWith(0, 2)
  })

  it('flags no more pages when fewer than pageSize+1 rows return', async () => {
    const { client } = createClient([row(1)])

    const result = await getSchedules(client, 0, 2)

    expect(result.hasNext).toBe(false)
    expect(result.schedules.map((s) => s.id)).toEqual([1])
  })
})
