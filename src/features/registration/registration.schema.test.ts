import { describe, it, expect } from 'vitest'
import { registrationSchema } from './registration.schema'

describe('registrationSchema', () => {
  it('accepts a valid owner', () => {
    const result = registrationSchema.safeParse({
      isOwner: true,
      organizationName: 'Crystal Springs',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an owner without a station name', () => {
    const result = registrationSchema.safeParse({
      isOwner: true,
      organizationName: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid staff member', () => {
    const result = registrationSchema.safeParse({
      isOwner: false,
      organizationCode: 'AQUA-123',
      contactNumber: '09171234567',
    })
    expect(result.success).toBe(true)
  })

  it('rejects staff missing branch fields', () => {
    const result = registrationSchema.safeParse({
      isOwner: false,
      organizationCode: 'AQUA-123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects staff with an invalid contact number', () => {
    const result = registrationSchema.safeParse({
      isOwner: false,
      organizationCode: 'AQUA-123',
      contactNumber: '123',
    })
    expect(result.success).toBe(false)
  })
})
