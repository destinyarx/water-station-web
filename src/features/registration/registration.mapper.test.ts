import { describe, it, expect } from 'vitest'
import { toEdgePayload } from './registration.mapper'

describe('toEdgePayload', () => {
  it('maps an owner with a null organization and no staff fields', () => {
    const payload = toEdgePayload({
      isOwner: true,
      waterStationName: 'Crystal Springs',
    })
    expect(payload).toEqual({ is_owner: true, organization: null })
    expect(payload).not.toHaveProperty('gender')
    expect(payload).not.toHaveProperty('phone_number')
  })

  it('maps a staff member with the invite code as organization', () => {
    const payload = toEdgePayload({
      isOwner: false,
      name: 'Juan dela Cruz',
      phoneNumber: '09171234567',
      gender: 'female',
      inviteCode: 'AQUA-123',
    })
    expect(payload).toEqual({
      is_owner: false,
      organization: 'AQUA-123',
      gender: 'female',
      phone_number: '09171234567',
    })
  })
})
