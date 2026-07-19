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
  materializeRecurringSchedule: (...args: unknown[]) => materialize(...args),
}))

const owner = { orgId: '00000000-0000-4000-8000-000000000321', createdBy: 'user_123' }

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
  org_id: '00000000-0000-4000-8000-000000000321',
  created_by: 'user_123',
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

beforeEach(() => {
  materialize.mockClear()
})

/** `.update().eq().select('id')` resolving to `rows`. */
function updateReturning(rows: Array<{ id: number }>) {
  return vi.fn(() => ({
    eq: () => ({ select: () => Promise.resolve({ data: rows, error: null }) }),
  }))
}

describe('pauseSchedule', () => {
  it('stops the schedule and archives eligible occurrences in one atomic RPC', async () => {
    const rpc = vi.fn(() => Promise.resolve({ error: null }))

    await pauseSchedule({ rpc } as unknown as SupabaseClient, 99, '2026-06-23')

    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('pause_delivery_schedule_atomic', {
      p_schedule_id: 99,
      p_today: '2026-06-23',
    })
  })

  it('throws when the atomic stop RPC is rejected', async () => {
    const rpc = vi.fn(() =>
      Promise.resolve({ error: { code: '42501', message: 'RLS rejected' } }),
    )

    await expect(
      pauseSchedule({ rpc } as unknown as SupabaseClient, 99, '2026-06-23'),
    ).rejects.toThrow('Unable to save delivery. Please try again.')

    expect(rpc).toHaveBeenCalledTimes(1)
  })
})

describe('resumeSchedule', () => {
  it('reactivates the schedule and tops up materialization forward from today', async () => {
    const scheduleUpdate = updateReturning([{ id: 99 }])
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

  it('throws and materializes nothing when the resume matches no rows', async () => {
    const from = vi.fn(() => ({ update: updateReturning([]) }))

    await expect(
      resumeSchedule(
        { from } as unknown as SupabaseClient,
        schedule,
        owner,
        '2026-06-23',
      ),
    ).rejects.toThrow()

    // A refused resume must not fill the queue for a still-paused schedule.
    expect(materialize).not.toHaveBeenCalled()
  })
})

describe('schedule lifecycle toggling', () => {
  it('routes stop, resume, then stop through the expected write seams', async () => {
    const rpc = vi.fn(() => Promise.resolve({ error: null }))
    const scheduleUpdate = updateReturning([{ id: 99 }])
    const from = vi.fn(() => ({ update: scheduleUpdate }))
    const client = { from, rpc } as unknown as SupabaseClient

    await pauseSchedule(client, schedule.id, '2026-06-23')
    await resumeSchedule(client, schedule, owner, '2026-06-23')
    await pauseSchedule(client, schedule.id, '2026-06-23')

    expect(rpc).toHaveBeenCalledTimes(2)
    expect(scheduleUpdate).toHaveBeenCalledTimes(1)
    expect(materialize).toHaveBeenCalledTimes(1)
  })
})
