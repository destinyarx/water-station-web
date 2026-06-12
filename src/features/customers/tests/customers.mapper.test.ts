import { describe, it, expect } from 'vitest'
import { toCustomer } from '../customers.mapper'
import type { CustomerRow } from '../customers.types'

const baseRow: CustomerRow = {
  id: 42,
  name: 'Crystal Springs',
  is_business: true,
  contact_number: '09171234567',
  facebook_url: 'https://facebook.com/crystal',
  latitude: 14.5995,
  longitude: 120.9842,
  street_address: '123 Main St',
  barangay: 'San Antonio',
  municipality: 'Pasig',
  province: 'Metro Manila',
  full_address: null,
  org_id: 7,
  created_by: 'user_2abcDEF',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

describe('toCustomer', () => {
  it('maps snake_case columns to the camelCase display model', () => {
    const customer = toCustomer(baseRow)
    expect(customer).toMatchObject({
      id: baseRow.id,
      name: 'Crystal Springs',
      isBusiness: true,
      contactNumber: '09171234567',
      facebookUrl: 'https://facebook.com/crystal',
      latitude: 14.5995,
      longitude: 120.9842,
      orgId: 7,
      createdBy: 'user_2abcDEF',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: null,
      deletedAt: null,
    })
  })

  it('assembles fullAddress from address parts when not stored', () => {
    const customer = toCustomer({ ...baseRow, full_address: null })
    expect(customer.fullAddress).toBe(
      '123 Main St, San Antonio, Pasig, Metro Manila',
    )
  })

  it('prefers the stored full_address when present', () => {
    const customer = toCustomer({
      ...baseRow,
      full_address: '  Stored full address  ',
    })
    expect(customer.fullAddress).toBe('Stored full address')
  })

  it('omits missing address parts when assembling', () => {
    const customer = toCustomer({
      ...baseRow,
      full_address: null,
      street_address: null,
      barangay: null,
    })
    expect(customer.fullAddress).toBe('Pasig, Metro Manila')
  })

  it('returns null fullAddress when no parts and none stored', () => {
    const customer = toCustomer({
      ...baseRow,
      full_address: null,
      street_address: null,
      barangay: null,
      municipality: null,
      province: null,
    })
    expect(customer.fullAddress).toBeNull()
  })
})
