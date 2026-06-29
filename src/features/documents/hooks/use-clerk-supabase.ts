'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClerkSupabaseClient } from '@/lib/supabase/client'
import { CLERK_SUPABASE_TEMPLATE } from '../documents.constants'

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
