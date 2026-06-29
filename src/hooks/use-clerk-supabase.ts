'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClerkSupabaseClient } from '@/lib/supabase/client'

/**
 * Memoized Supabase client authenticated with the signed-in user's Clerk token.
 * Shared by feature query and mutation hooks so Supabase RLS sees Clerk claims.
*/
export function useClerkSupabase(): SupabaseClient {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createClerkSupabaseClient(() =>
        getToken({ template: 'water-station' }),
      ),
    [getToken],
  )
}
