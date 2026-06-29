'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { getActiveCustomers } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import type { Customer } from '../customers.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

/**
 * Loads the active customer list for the signed-in user's tenant. The Supabase
 * client is authenticated with the Clerk token so RLS scopes the results.
 */
export function useCustomers(): UseQueryResult<Customer[], Error> {
  const client = useClerkSupabase()

  return useQuery<Customer[], Error>({
    queryKey: customerKeys.list({ archived: false }),
    queryFn: () => getActiveCustomers(client),
  })
}
