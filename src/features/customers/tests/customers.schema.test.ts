import { describe, it, expect } from 'vitest'
import { customerRowSchema } from '../customers.schema'

const validRow = {
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
  full_address: '123 Main St, San Antonio, Pasig, Metro Manila',
  org_id: 7,
  created_by: 'user_2abcDEF',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

describe('customerRowSchema', () => {
  it('accepts a valid customer row', () => {
    const result = customerRowSchema.safeParse(validRow)
    expect(result.success).toBe(true)
  })

  it('accepts a row with nullable optional fields omitted as null', () => {
    const result = customerRowSchema.safeParse({
      ...validRow,
      contact_number: null,
      facebook_url: null,
      latitude: null,
      longitude: null,
      street_address: null,
      barangay: null,
      municipality: null,
      province: null,
      full_address: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a row without a name', () => {
    const rest: Record<string, unknown> = { ...validRow }
    delete rest.name
    const result = customerRowSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer org_id', () => {
    const result = customerRowSchema.safeParse({ ...validRow, org_id: 1.5 })
    expect(result.success).toBe(false)
  })
})
