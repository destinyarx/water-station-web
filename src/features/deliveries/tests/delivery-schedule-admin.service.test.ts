import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  pauseSchedule,
  resumeSchedule,
} from '../services/delivery-schedule-admin.service'
import type { DeliveryScheduleRow } from '../deliveries.types'

const materialize = vi.fn((...args: unknown[]) => {
  void args
  return Promise.resolve(2)
})
vi.mock('../services/delivery-materialize.service', () => ({
  materializeWeeklySchedule: (...args: unknown[]) => materialize(...args),
}))

const owner = { orgId: 321, createdBy: 'user_123' }

const schedule: DeliveryScheduleRow = {
  id: 99,
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
  org_id: 321,
  created_by: 'user_123',
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

beforeEach(() => {
  materialize.mockClear()
})

describe('pauseSchedule', () => {
  it('pauses the schedule and soft-deletes only pending occurrences dated >= today', async () => {
    const scheduleUpdate = vi.fn(() => ({ eq: () => Promise.resolve({ error: null }) }))

    const occurrenceFilters: Array<[string, unknown]> = []
    let occurrenceUpdatePayload: Record<string, unknown> | null = null
    function occurrenceUpdate(payload: Record<string, unknown>) {
      occurrenceUpdatePayload = payload
      const builder = {
        eq: (column: string, value: unknown) => {
          occurrenceFilters.push([column, value])
          return builder
        },
        gte: (column: string, value: unknown) => {
          occurrenceFilters.push([column, value])
          return builder
        },
        is: (column: string, value: unknown) => {
          occurrenceFilters.push([column, value])
          return Promise.resolve({ error: null })
        },
      }
      return builder
    }

    const from = vi.fn((table: string) => {
      if (table === 'delivery_schedules') return { update: scheduleUpdate }
      return { update: occurrenceUpdate }
    })

    await pauseSchedule({ from } as unknown as SupabaseClient, 99, '2026-06-23')

    expect(scheduleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paused' }),
    )
    expect(occurrenceUpdatePayload).not.toBeNull()
    expect(occurrenceUpdatePayload).toHaveProperty('deleted_at')
    expect(occurrenceFilters).toEqual([
      ['schedule_id', 99],
      ['status', 'pending'],
      ['delivery_date', '2026-06-23'],
      ['deleted_at', null],
    ])
  })
})

describe('resumeSchedule', () => {
  it('reactivates the schedule and tops up materialization forward from today', async () => {
    const scheduleUpdate = vi.fn(() => ({ eq: () => Promise.resolve({ error: null }) }))
    const from = vi.fn(() => ({ update: scheduleUpdate }))

    await resumeSchedule(
      { from } as unknown as SupabaseClient,
      schedule,
      owner,
      '2026-06-23',
    )

    expect(scheduleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
    )
    expect(materialize).toHaveBeenCalledTimes(1)
    const [, passedSchedule, , fromDate] = materialize.mock.calls[0]
    expect(passedSchedule).toBe(schedule)
    expect(fromDate).toBe('2026-06-23')
  })
})
