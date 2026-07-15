import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createWeeklySchedule } from '../services/delivery-schedule.service'
import type { DeliveryScheduleFormValues } from '../deliveries.types'

const materialize = vi.fn((...args: unknown[]) => {
  void args
  return Promise.resolve(2)
})
vi.mock('../services/delivery-materialize.service', () => ({
  materializeRecurringSchedule: (...args: unknown[]) => materialize(...args),
}))

const owner = { orgId: '00000000-0000-4000-8000-000000000321', createdBy: 'user_123' }

const values: DeliveryScheduleFormValues = {
  targetType: 'customer',
  customerId: 7,
  guestName: '',
  guestContact: '',
  guestAddress: '',
  weekdays: [1, 4],
  intervalWeeks: 1,
  startDate: '2026-06-01',
  endDate: null,
  items: [{ productId: 10, productName: 'Bottle', quantity: 3, unitPrice: 30 }],
  notes: 'Standing order.',
  assignedTo: '',
}

const scheduleRow = {
  id: 99,
  customer_id: 7,
  guest_name: null,
  guest_contact: null,
  guest_address: null,
  recurrence_type: 'weekly' as const,
  start_date: '2026-06-01',
  delivery_date: null,
  weekdays: [1, 4],
  interval_weeks: 1,
  day_of_month: null,
  interval_months: null,
  end_date: null,
  status: 'active' as const,
  notes: 'Standing order.',
  assigned_to: null,
  org_id: '00000000-0000-4000-8000-000000000321',
  created_by: 'user_123',
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

function createClient() {
  const insertScheduleItems = vi.fn(() => Promise.resolve({ error: null }))
  const insertSchedule = vi.fn(() => ({
    select: () => ({
      single: () => Promise.resolve({ data: scheduleRow, error: null }),
    }),
  }))

  const from = vi.fn((table: string) => {
    if (table === 'delivery_schedules') return { insert: insertSchedule }
    if (table === 'delivery_schedule_items') return { insert: insertScheduleItems }
    return {}
  })

  return {
    client: { from } as unknown as SupabaseClient,
    insertSchedule,
    insertScheduleItems,
  }
}

beforeEach(() => {
  materialize.mockClear()
})

describe('createWeeklySchedule', () => {
  it('inserts the schedule, its template items, then materializes occurrences', async () => {
    const { client, insertSchedule, insertScheduleItems } = createClient()

    const result = await createWeeklySchedule(client, values, owner)

    expect(insertSchedule).toHaveBeenCalledTimes(1)
    expect(insertScheduleItems).toHaveBeenCalledTimes(1)
    expect(insertScheduleItems).toHaveBeenCalledWith([
      { schedule_id: 99, product_id: 10, quantity: 3, unit_price: 30, org_id: '00000000-0000-4000-8000-000000000321' },
    ])
    expect(materialize).toHaveBeenCalledTimes(1)
    expect(result).toEqual(scheduleRow)
  })
})
