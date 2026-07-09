import { describe, expect, it } from 'vitest'

import {
  toDelivery,
  toDeliveryInsertRow,
  toDeliveryItemInsertRows,
  toScheduleInsertRow,
  toStatusTransitionItems,
} from '../deliveries.mapper'
import type { DeliveryItem } from '../deliveries.types'
import type {
  DeliveryFormValues,
  DeliveryItemRow,
  DeliveryRow,
} from '../deliveries.types'

const values: DeliveryFormValues = {
  targetType: 'guest',
  customerId: undefined,
  guestName: 'Aling Nena Store',
  guestContact: '09171234567',
  guestAddress: 'Purok 2',
  recurrenceType: 'one_time',
  deliveryDate: '2026-06-16',
  items: [
    {
      productId: 10,
      productName: '5 Gallon Water Refill',
      quantity: 3,
      unitPrice: 30,
    },
    {
      productId: 11,
      productName: 'Delivery Fee',
      quantity: 1,
      unitPrice: 20,
    },
  ],
  notes: 'Call before leaving.',
  assignedTo: '',
}

const owner = { orgId: '00000000-0000-4000-8000-000000000321', createdBy: 'user_123' }

describe('delivery mappers', () => {
  it('maps form values to a one-time schedule insert with trusted owner fields', () => {
    expect(toScheduleInsertRow(values, owner)).toEqual({
      customer_id: null,
      guest_name: 'Aling Nena Store',
      guest_contact: '09171234567',
      guest_address: 'Purok 2',
      recurrence_type: 'one_time',
      delivery_date: '2026-06-16',
      start_date: null,
      weekdays: null,
      interval_weeks: null,
      day_of_month: null,
      interval_months: null,
      end_date: null,
      status: 'active',
      notes: 'Call before leaving.',
      assigned_to: null,
      org_id: '00000000-0000-4000-8000-000000000321',
      created_by: 'user_123',
    })
  })

  it('maps one delivery occurrence and snapshots item names and prices', () => {
    expect(toDeliveryInsertRow(99, values, owner)).toEqual({
      schedule_id: 99,
      delivery_date: '2026-06-16',
      status: 'pending',
      notes: 'Call before leaving.',
      assigned_to: null,
      org_id: '00000000-0000-4000-8000-000000000321',
      created_by: 'user_123',
    })

    expect(toDeliveryItemInsertRows(77, values, owner)).toEqual([
      {
        delivery_id: 77,
        product_id: 10,
        product_name: '5 Gallon Water Refill',
        quantity: 3,
        unit_price: 30,
        org_id: '00000000-0000-4000-8000-000000000321',
      },
      {
        delivery_id: 77,
        product_id: 11,
        product_name: 'Delivery Fee',
        quantity: 1,
        unit_price: 20,
        org_id: '00000000-0000-4000-8000-000000000321',
      },
    ])
  })

  it('maps rows to a display delivery with computed line totals and total', () => {
    const row: DeliveryRow = {
      id: 77,
      schedule_id: 99,
      delivery_date: '2026-06-16',
      status: 'pending',
      failure_remarks: null,
      cancellation_remarks: null,
      notes: 'Call before leaving.',
      assigned_to: null,
      delivered_by: null,
      completed_at: null,
      org_id: '00000000-0000-4000-8000-000000000321',
      created_by: 'user_123',
      created_at: '2026-06-16T00:00:00.000Z',
      updated_at: null,
      deleted_at: null,
    }

    const items: DeliveryItemRow[] = [
      {
        id: 1,
        delivery_id: 77,
        product_id: 10,
        product_name: '5 Gallon Water Refill',
        quantity: 3,
        unit_price: 30,
        org_id: '00000000-0000-4000-8000-000000000321',
        created_at: '2026-06-16T00:00:00.000Z',
        updated_at: null,
      },
      {
        id: 2,
        delivery_id: 77,
        product_id: 11,
        product_name: 'Delivery Fee',
        quantity: 1,
        unit_price: 20,
        org_id: '00000000-0000-4000-8000-000000000321',
        created_at: '2026-06-16T00:00:00.000Z',
        updated_at: null,
      },
    ]

    expect(toDelivery(row, items)).toMatchObject({
      id: 77,
      deliveryDate: '2026-06-16',
      items: [
        { productName: '5 Gallon Water Refill', lineTotal: 90 },
        { productName: 'Delivery Fee', lineTotal: 20 },
      ],
      total: 110,
    })
  })

  it('marks items stock-tracked from the product catalog, defaulting missing products to untracked', () => {
    const items = [
      { productId: 10, productName: 'Bottle', quantity: 3 },
      { productId: 11, productName: 'Refill', quantity: 1 },
      { productId: 99, productName: 'Gone', quantity: 2 },
    ] as DeliveryItem[]

    expect(
      toStatusTransitionItems(items, [
        { id: 10, isStockTracked: true },
        { id: 11, isStockTracked: false },
      ]),
    ).toEqual([
      { productId: 10, productName: 'Bottle', quantity: 3, isStockTracked: true },
      { productId: 11, productName: 'Refill', quantity: 1, isStockTracked: false },
      { productId: 99, productName: 'Gone', quantity: 2, isStockTracked: false },
    ])
  })
})
