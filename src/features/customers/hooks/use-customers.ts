'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { createClerkSupabaseClient } from '@/lib/supabase/client'
import { getActiveCustomers } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import type { Customer } from '../customers.types'

/**
 * Loads the active customer list for the signed-in user's tenant. The Supabase
 * client is authenticated with the Clerk token so RLS scopes the results.
 */
export function useCustomers(): UseQueryResult<Customer[], Error> {
  const { getToken } = useAuth()

  const client = useMemo(
    () => createClerkSupabaseClient(() => getToken()),
    [getToken],
  )

  return useQuery<Customer[], Error>({
    queryKey: customerKeys.list({ archived: false }),
    queryFn: () => getActiveCustomers(client),
  })
}
