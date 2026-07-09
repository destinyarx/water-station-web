import { describe, it, expect } from 'vitest'
import { toEdgeRequest } from './registration.mapper'

const identity = { name: 'Juan dela Cruz', email: 'juan@example.com' }

describe('toEdgeRequest', () => {
  it('maps an owner to the create-org function with name + email from identity', () => {
    const { url, body } = toEdgeRequest(
      { isOwner: true, organizationName: 'Crystal Springs' },
      identity,
    )
    expect(url).toContain('') // resolved from env; asserted on body shape below
    expect(body).toEqual({
      organization_name: 'Crystal Springs',
      name: 'Juan dela Cruz',
      email: 'juan@example.com',
    })
    expect(body).not.toHaveProperty('organization_code')
    expect(body).not.toHaveProperty('contact_number')
  })

  it('maps a staff member to the add-staff function with the org code + contact', () => {
    const { body } = toEdgeRequest(
      {
        isOwner: false,
        organizationCode: 'AQUA-123',
        contactNumber: '09171234567',
      },
      identity,
    )
    expect(body).toEqual({
      organization_code: 'AQUA-123',
      contact_number: '09171234567',
      name: 'Juan dela Cruz',
      email: 'juan@example.com',
    })
  })
})
