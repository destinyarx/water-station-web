import { describe, expect, it } from 'vitest'

import {
  nextUpcomingDate,
  recurrenceSummary,
  scheduleRecipient,
} from '../deliveries.schedule-view'
import type { DeliveryScheduleRow } from '../deliveries.types'

function schedule(
  overrides: Partial<DeliveryScheduleRow> = {},
): DeliveryScheduleRow {
  return {
    id: 1,
    customer_id: null,
    guest_name: 'Walk-in',
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
    ...overrides,
  }
}

describe('scheduleRecipient', () => {
  it('uses the guest name when there is no customer name', () => {
    expect(scheduleRecipient(schedule(), null)).toBe('Walk-in')
  })

  it('prefers the resolved customer name', () => {
    expect(
      scheduleRecipient(schedule({ customer_id: 7, guest_name: null }), 'Maria'),
    ).toBe('Maria')
  })
})

describe('recurrenceSummary', () => {
  it('summarizes weekly weekdays with the interval', () => {
    expect(recurrenceSummary(schedule())).toBe('Weekly · Mon, Thu')
    expect(recurrenceSummary(schedule({ interval_weeks: 2 }))).toBe(
      'Every 2 weeks · Mon, Thu',
    )
  })
})

describe('nextUpcomingDate', () => {
  it('returns the nearest occurrence on or after today within the horizon', () => {
    // 2026-06-23 is a Tuesday; next Mon/Thu is Thu Jun 25.
    expect(nextUpcomingDate(schedule(), '2026-06-23', 14)).toBe('2026-06-25')
  })

  it('returns null when nothing falls inside the horizon', () => {
    expect(
      nextUpcomingDate(schedule({ end_date: '2026-06-10' }), '2026-06-23', 14),
    ).toBeNull()
  })
})
