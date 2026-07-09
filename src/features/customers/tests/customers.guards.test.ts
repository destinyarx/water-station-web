import { describe, it, expect } from 'vitest'
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
  createdBy: 'user_2abcDEF',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
}

describe('canEditCustomer', () => {
  it('allows editing an active customer', () => {
    expect(canEditCustomer(activeCustomer)).toBe(true)
  })

  it('blocks editing an archived customer', () => {
    expect(
      canEditCustomer({
        ...activeCustomer,
        deletedAt: '2026-02-01T00:00:00.000Z',
      }),
    ).toBe(false)
  })
})
