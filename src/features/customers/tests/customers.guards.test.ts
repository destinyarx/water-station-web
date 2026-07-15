import { describe, expect, it } from 'vitest'

import { canEditCustomer } from '../customers.guards'
import type { Customer } from '../customers.types'

const activeCustomer: Customer = {
  id: 1,
  name: 'Crystal Springs',
  isBusiness: true,
  contactNumber: null,
  facebookUrl: null,
  latitude: null,
  longitude: null,
  streetAddress: null,
  barangay: null,
  municipality: null,
  province: null,
  fullAddress: null,
  isActive: true,
  orgId: '00000000-0000-4000-8000-000000000007',
  createdBy: 'user_staff',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
}

describe('canEditCustomer', () => {
  it('allows staff to edit a customer they created', () => {
    expect(
      canEditCustomer(activeCustomer, {
        userId: 'user_staff',
        isOwner: false,
      }),
    ).toBe(true)
  })

  it('allows owners to edit another org member customer', () => {
    expect(
      canEditCustomer(activeCustomer, {
        userId: 'user_owner',
        isOwner: true,
      }),
    ).toBe(true)
  })

  it('blocks staff from editing a customer created by someone else', () => {
    expect(
      canEditCustomer(activeCustomer, {
        userId: 'user_other',
        isOwner: false,
      }),
    ).toBe(false)
  })

  it('blocks archived customers for every role', () => {
    expect(
      canEditCustomer(
        {
          ...activeCustomer,
          deletedAt: '2026-02-01T00:00:00.000Z',
        },
        { userId: 'user_owner', isOwner: true },
      ),
    ).toBe(false)
  })

  it('blocks actions while trusted actor claims are unavailable', () => {
    expect(canEditCustomer(activeCustomer, null)).toBe(false)
  })
})
