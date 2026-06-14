'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClerkSupabaseClient } from '@/lib/supabase/client'
import { CLERK_SUPABASE_TEMPLATE } from '../customers.constants'

/**
 * Memoized Supabase client authenticated with the signed-in user's Clerk token.
 * Shared by every customer query and mutation so RLS scopes rows to the tenant.
 */
export function useClerkSupabase(): SupabaseClient {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createClerkSupabaseClient(() =>
        getToken({ template: CLERK_SUPABASE_TEMPLATE }),
      ),
    [getToken],
  )
}
