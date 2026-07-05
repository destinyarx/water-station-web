import { describe, expect, it } from 'vitest'

import { canAccessAquaflowAi } from '../aquaflow-ai.guards'

describe('canAccessAquaflowAi', () => {
  it('allows a registered owner session', () => {
    expect(canAccessAquaflowAi({ organization: '7', is_owner: true })).toBe(true)
  })

  it('rejects a staff session even in a valid org', () => {
    expect(canAccessAquaflowAi({ organization: '7', is_owner: false })).toBe(false)
  })

  it('rejects when the org claim is missing', () => {
    expect(canAccessAquaflowAi({ organization: null, is_owner: true })).toBe(false)
  })

  it('rejects when the owner claim is missing', () => {
    expect(canAccessAquaflowAi({ organization: '7' })).toBe(false)
  })

  it('rejects null/undefined claims', () => {
    expect(canAccessAquaflowAi(null)).toBe(false)
    expect(canAccessAquaflowAi(undefined)).toBe(false)
  })
})
