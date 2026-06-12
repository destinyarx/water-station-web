import { describe, it, expect } from 'vitest'
import { registrationSchema } from './registration.schema'

describe('registrationSchema', () => {
  it('accepts a valid owner', () => {
    const result = registrationSchema.safeParse({
      isOwner: true,
      waterStationName: 'Crystal Springs',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an owner without a station name', () => {
    const result = registrationSchema.safeParse({
      isOwner: true,
      waterStationName: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid staff member', () => {
    const result = registrationSchema.safeParse({
      isOwner: false,
      name: 'Juan dela Cruz',
      phoneNumber: '09171234567',
      gender: 'male',
      inviteCode: 'AQUA-123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects staff missing branch fields', () => {
    const result = registrationSchema.safeParse({
      isOwner: false,
      name: 'Juan dela Cruz',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid gender', () => {
    const result = registrationSchema.safeParse({
      isOwner: false,
      name: 'Juan dela Cruz',
      phoneNumber: '09171234567',
      gender: 'unknown',
      inviteCode: 'AQUA-123',
    })
    expect(result.success).toBe(false)
  })
})
