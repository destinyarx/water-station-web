import { describe, it, expect } from 'vitest'
import { toInsertRow } from '../customers.mapper'
import type { CustomerFormValues } from '../customers.types'

const owner = { orgId: '00000000-0000-4000-8000-000000000007', createdBy: 'user_2abcDEF' }

const fullValues: CustomerFormValues = {
  name: 'Crystal Springs',
  isBusiness: true,
  contactNumber: '09171234567',
  facebookUrl: 'https://facebook.com/crystal',
  streetAddress: '123 Main St',
  barangay: 'San Antonio',
  municipality: 'Pasig',
  province: 'Metro Manila',
  latitude: 14.5995,
  longitude: 120.9842,
}

describe('toInsertRow', () => {
  it('maps form values to a snake_case insert payload with owner fields', () => {
    const row = toInsertRow(fullValues, owner)
    expect(row).toMatchObject({
      name: 'Crystal Springs',
      is_business: true,
      contact_number: '09171234567',
      facebook_url: 'https://facebook.com/crystal',
      street_address: '123 Main St',
      latitude: 14.5995,
      longitude: 120.9842,
      org_id: '00000000-0000-4000-8000-000000000007',
      created_by: 'user_2abcDEF',
    })
  })

  it('converts blank optional strings to null', () => {
    const row = toInsertRow(
      {
        name: 'Walk-in',
        isBusiness: false,
        contactNumber: '',
        facebookUrl: '',
        streetAddress: '',
        barangay: '',
        municipality: '',
        province: '',
        latitude: undefined,
        longitude: undefined,
      },
      owner,
    )
    expect(row.contact_number).toBeNull()
    expect(row.facebook_url).toBeNull()
    expect(row.street_address).toBeNull()
    expect(row.latitude).toBeNull()
    expect(row.longitude).toBeNull()
    expect(row.full_address).toBeNull()
  })

  it('assembles full_address from the provided address parts', () => {
    const row = toInsertRow(fullValues, owner)
    expect(row.full_address).toBe('123 Main St, San Antonio, Pasig, Metro Manila')
  })

  it('never trusts a client-supplied id, tenant, or creator beyond the owner arg', () => {
    const row = toInsertRow(fullValues, owner)
    expect(Object.keys(row)).not.toContain('id')
    expect(row.org_id).toBe(owner.orgId)
    expect(row.created_by).toBe(owner.createdBy)
  })
})
