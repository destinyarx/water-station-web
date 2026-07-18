import { describe, expect, it } from 'vitest'

import {
  deliveryTerminalTimestamp,
  nextUpcomingDate,
  recurrenceSummary,
  scheduleRecipient,
  scheduleTiming,
} from '../deliveries.schedule-view'
import type {
  Delivery,
  DeliveryScheduleListItem,
  DeliveryScheduleRow,
} from '../deliveries.types'

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
    assigned_to: null,
    org_id: '00000000-0000-4000-8000-000000000321',
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

describe('scheduleTiming', () => {
  function item(
    currentDeliveryDate: string | null,
    nextDeliveryDate: string | null,
  ): DeliveryScheduleListItem {
    return {
      schedule: schedule(),
      customerName: null,
      customerIsBusiness: null,
      items: [],
      currentDeliveryDate,
      nextDeliveryDate,
    }
  }

  it('prioritizes current due work over a future pending occurrence', () => {
    expect(scheduleTiming(item('2026-07-18', '2026-07-21'))).toEqual({
      kind: 'current',
      date: '2026-07-18',
    })
  })

  it('falls back to Next and then an empty state', () => {
    expect(scheduleTiming(item(null, '2026-07-21'))).toEqual({
      kind: 'next',
      date: '2026-07-21',
    })
    expect(scheduleTiming(item(null, null))).toEqual({ kind: 'empty', date: null })
  })
})

describe('deliveryTerminalTimestamp', () => {
  it('uses updatedAt for cancelled rows whose completedAt is null', () => {
    const delivery = {
      id: 1,
      scheduleId: 1,
      deliveryDate: '2026-07-17',
      status: 'cancelled',
      failureRemarks: null,
      cancellationRemarks: 'Customer unavailable',
      notes: null,
      assignedTo: null,
      deliveredBy: null,
      completedAt: null,
      orgId: '00000000-0000-4000-8000-000000000321',
      createdBy: 'user_123',
      createdAt: '2026-07-10T00:00:00.000Z',
      updatedAt: '2026-07-18T04:00:00.000Z',
      deletedAt: null,
      items: [],
      total: 0,
    } satisfies Delivery

    expect(deliveryTerminalTimestamp(delivery)).toBe(
      '2026-07-18T04:00:00.000Z',
    )
  })
})
