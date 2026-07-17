import { describe, expect, it } from 'vitest'

import { deliveryFormSchema } from '../deliveries.schema'

const today = new Date().toISOString().slice(0, 10)

describe('deliveryFormSchema', () => {
  it('accepts a one-time delivery for an existing customer with item lines', () => {
    const result = deliveryFormSchema.safeParse({
      targetType: 'customer',
      customerId: 24,
      guestName: '',
      guestContact: '',
      guestAddress: '',
      recurrenceType: 'one_time',
      deliveryDate: today,
      items: [
        {
          productId: 8,
          productName: '5 Gallon Water Refill',
          quantity: 2,
          unitPrice: 35,
          isStockTracked: false,
        },
      ],
      notes: 'Bring extra caps.',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.customerId).toBe(24)
      expect(result.data.guestName).toBe('')
    }
  })

  it('requires either a customer or a guest name, but not both', () => {
    const missingTarget = deliveryFormSchema.safeParse({
      targetType: 'guest',
      customerId: undefined,
      guestName: '',
      guestContact: '',
      guestAddress: '',
      recurrenceType: 'one_time',
      deliveryDate: today,
      items: [
        {
          productId: 8,
          productName: '5 Gallon Water Refill',
          quantity: 1,
          unitPrice: 35,
        },
      ],
      notes: '',
    })

    const bothTargets = deliveryFormSchema.safeParse({
      targetType: 'customer',
      customerId: 24,
      guestName: 'Walk-in buyer',
      guestContact: '',
      guestAddress: '',
      recurrenceType: 'one_time',
      deliveryDate: today,
      items: [
        {
          productId: 8,
          productName: '5 Gallon Water Refill',
          quantity: 1,
          unitPrice: 35,
        },
      ],
      notes: '',
    })

    expect(missingTarget.success).toBe(false)
    expect(bothTargets.success).toBe(false)
  })
})
