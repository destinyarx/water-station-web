import { afterEach, describe, expect, it, vi } from 'vitest'

import { createClerkSupabaseClient } from './client'

describe('createClerkSupabaseClient', () => {
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalSupabaseKey
    vi.restoreAllMocks()
  })

  it('does not call Clerk getToken during non-browser client construction', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key'

    const getToken = vi.fn(async () => 'token')

    const client = createClerkSupabaseClient(getToken)

    expect(client).toBeTruthy()
    expect(getToken).not.toHaveBeenCalled()
  })
})
