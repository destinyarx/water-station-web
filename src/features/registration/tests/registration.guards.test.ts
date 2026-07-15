import { describe, it, expect } from 'vitest'
import { isRegistered } from '../registration.guards'

describe('isRegistered', () => {
  it('is true only when both claims are non-null', () => {
    expect(isRegistered({ organization: 'AQUA-123', is_owner: true })).toBe(true)
    expect(isRegistered({ organization: 'AQUA-123', is_owner: false })).toBe(
      true,
    )
  })

  it('is false when organization is missing or null', () => {
    expect(isRegistered({ is_owner: true })).toBe(false)
    expect(isRegistered({ organization: null, is_owner: true })).toBe(false)
  })

  it('is false when is_owner is missing or null', () => {
    expect(isRegistered({ organization: 'AQUA-123' })).toBe(false)
    expect(isRegistered({ organization: 'AQUA-123', is_owner: null })).toBe(
      false,
    )
  })

  it('is false for null or undefined claims', () => {
    expect(isRegistered(null)).toBe(false)
    expect(isRegistered(undefined)).toBe(false)
  })
})
