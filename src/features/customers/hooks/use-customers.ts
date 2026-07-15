'use client'

import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

import { customerKeys, type CustomerFilters } from '../customers.keys'
import {
  getActiveCustomers,
  getCustomerOptions,
  getCustomerStats,
} from '../services/customers.service'
import type {
  Customer,
  CustomerPage,
  CustomerStats,
} from '../customers.types'

export function useCustomers(
  filters: CustomerFilters,
): UseQueryResult<CustomerPage, Error> {
  const client = useClerkSupabase()

  return useQuery<CustomerPage, Error>({
    queryKey: customerKeys.list(filters),
    queryFn: () => getActiveCustomers(client, filters),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerStats(): UseQueryResult<CustomerStats, Error> {
  const client = useClerkSupabase()

  return useQuery<CustomerStats, Error>({
    queryKey: customerKeys.stats(),
    queryFn: () => getCustomerStats(client),
  })
}

export function useCustomerOptions(): UseQueryResult<Customer[], Error> {
  const client = useClerkSupabase()

  return useQuery<Customer[], Error>({
    queryKey: customerKeys.options(),
    queryFn: () => getCustomerOptions(client),
  })
}
