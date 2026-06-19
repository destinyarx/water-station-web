'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClerkSupabaseClient } from '@/lib/supabase/client'

const CLERK_SUPABASE_TEMPLATE = 'water-station'

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
