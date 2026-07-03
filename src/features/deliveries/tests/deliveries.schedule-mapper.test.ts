import { describe, expect, it } from 'vitest'

import {
  toScheduleItemInsertRows,
  toWeeklyScheduleInsertRow,
} from '../deliveries.mapper'
import type { DeliveryScheduleFormValues } from '../deliveries.types'

const owner = { orgId: 321, createdBy: 'user_123' }

function baseValues(
  overrides: Partial<DeliveryScheduleFormValues> = {},
): DeliveryScheduleFormValues {
  return {
    targetType: 'customer',
    customerId: 7,
    guestName: '',
    guestContact: '',
    guestAddress: '',
    weekdays: [1, 4],
    intervalWeeks: 2,
    startDate: '2026-06-01',
    endDate: null,
    items: [
      { productId: 10, productName: 'Bottle', quantity: 3, unitPrice: 30 },
      { productId: 11, productName: 'Delivery Fee', quantity: 1, unitPrice: 25 },
    ],
    notes: 'Standing order.',
    assignedTo: '',
    ...overrides,
  }
}

describe('toWeeklyScheduleInsertRow', () => {
  it('maps a customer weekly schedule with recurrence fields', () => {
    expect(toWeeklyScheduleInsertRow(baseValues(), owner)).toEqual({
      customer_id: 7,
      guest_name: null,
      guest_contact: null,
      guest_address: null,
      recurrence_type: 'weekly',
      delivery_date: null,
      start_date: '2026-06-01',
      weekdays: [1, 4],
      interval_weeks: 2,
      day_of_month: null,
      interval_months: null,
      end_date: null,
      status: 'active',
      notes: 'Standing order.',
      assigned_to: null,
      org_id: 321,
      created_by: 'user_123',
    })
  })

  it('maps a guest weekly schedule, dropping the customer id', () => {
    const row = toWeeklyScheduleInsertRow(
      baseValues({
        targetType: 'guest',
        customerId: undefined,
        guestName: 'Walk-in',
        guestContact: '0917',
        guestAddress: 'Street 1',
        endDate: '2026-08-01',
      }),
      owner,
    )

    expect(row.customer_id).toBeNull()
    expect(row.guest_name).toBe('Walk-in')
    expect(row.guest_contact).toBe('0917')
    expect(row.guest_address).toBe('Street 1')
    expect(row.end_date).toBe('2026-08-01')
  })
})

describe('toScheduleItemInsertRows', () => {
  it('maps form items to template lines with unit_price overrides', () => {
    expect(toScheduleItemInsertRows(99, baseValues(), owner)).toEqual([
      { schedule_id: 99, product_id: 10, quantity: 3, unit_price: 30, org_id: 321 },
      { schedule_id: 99, product_id: 11, quantity: 1, unit_price: 25, org_id: 321 },
    ])
  })
})
