import { describe, it, expect } from 'vitest'
import { toFormValues } from '../customers.mapper'
import type { Customer } from '../customers.types'

const customer: Customer = {
  id: 42,
  name: 'Crystal Springs',
  isBusiness: true,
  contactNumber: '09171234567',
  facebookUrl: null,
  latitude: 14.5995,
  longitude: null,
  streetAddress: '123 Main St',
  barangay: null,
  municipality: 'Pasig',
  province: null,
  fullAddress: '123 Main St, Pasig',
  isActive: true,
  orgId: '00000000-0000-4000-8000-000000000007',
  createdBy: 'user_2abcDEF',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
}

describe('toFormValues', () => {
  it('maps a customer to editable form values', () => {
    expect(toFormValues(customer)).toEqual({
      name: 'Crystal Springs',
      isBusiness: true,
      contactNumber: '09171234567',
      facebookUrl: '',
      streetAddress: '123 Main St',
      barangay: '',
      municipality: 'Pasig',
      province: '',
      latitude: 14.5995,
      longitude: undefined,
    })
  })
})
