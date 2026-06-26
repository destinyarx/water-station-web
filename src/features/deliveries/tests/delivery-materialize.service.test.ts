import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { materializeWeeklySchedule } from '../services/delivery-materialize.service'
import type { DeliveryScheduleRow } from '../deliveries.types'

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
  weekdays: [1],
  interval_weeks: 1,
  day_of_month: null,
  interval_months: null,
  end_date: null,
  status: 'active',
  notes: 'Standing order.',
  org_id: 321,
  created_by: 'user_123',
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

const templateItems = [
  { product_id: 10, quantity: 3, unit_price: null },
  { product_id: 11, quantity: 1, unit_price: 25 },
]

const products = [
  { id: 10, product_name: 'Bottle', price: 30 },
  { id: 11, product_name: 'Delivery Fee', price: 20 },
]

function createClient(existingDates: string[]) {
  const insertItems = vi.fn(() => Promise.resolve({ error: null }))
  let nextId = 101

  function deliveriesBuilder() {
    const b = {
      select: () => b,
      eq: () => b,
      is: () => b,
      gte: () => b,
      lte: () =>
        Promise.resolve({
          data: existingDates.map((d) => ({ delivery_date: d })),
          error: null,
        }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({ data: { id: nextId++ }, error: null }),
        }),
      }),
    }
    return b
  }

  const from = vi.fn((table: string) => {
    if (table === 'deliveries') return deliveriesBuilder()
    if (table === 'delivery_schedule_items') {
      return { select: () => ({ eq: () => Promise.resolve({ data: templateItems, error: null }) }) }
    }
    if (table === 'products') {
      return { select: () => ({ in: () => Promise.resolve({ data: products, error: null }) }) }
    }
    return { insert: insertItems }
  })

  return { client: { from } as unknown as SupabaseClient, insertItems }
}

describe('materializeWeeklySchedule', () => {
  it('creates missing occurrences and copies template items with resolved prices', async () => {
    const { client, insertItems } = createClient(['2026-06-01'])

    const created = await materializeWeeklySchedule(
      client,
      schedule,
      owner,
      '2026-06-01',
      '2026-06-15',
    )

    expect(created).toBe(2)
    // Two occurrences (Jun 8 -> id 101, Jun 15 -> id 102), two template lines each.
    expect(insertItems).toHaveBeenCalledTimes(1)
    expect(insertItems).toHaveBeenCalledWith([
      { delivery_id: 101, product_id: 10, product_name: 'Bottle', quantity: 3, unit_price: 30, org_id: 321 },
      { delivery_id: 101, product_id: 11, product_name: 'Delivery Fee', quantity: 1, unit_price: 25, org_id: 321 },
      { delivery_id: 102, product_id: 10, product_name: 'Bottle', quantity: 3, unit_price: 30, org_id: 321 },
      { delivery_id: 102, product_id: 11, product_name: 'Delivery Fee', quantity: 1, unit_price: 25, org_id: 321 },
    ])
  })

  it('is idempotent: no occurrence created when every due date already exists', async () => {
    const { client, insertItems } = createClient([
      '2026-06-01',
      '2026-06-08',
      '2026-06-15',
    ])

    const created = await materializeWeeklySchedule(
      client,
      schedule,
      owner,
      '2026-06-01',
      '2026-06-15',
    )

    expect(created).toBe(0)
    expect(insertItems).not.toHaveBeenCalled()
  })
})
