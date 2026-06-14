'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'

import { updateCustomer } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import type { Customer, CustomerFormValues } from '../customers.types'
import { useClerkSupabase } from './use-clerk-supabase'

interface UpdateCustomerVariables {
  id: number
  values: CustomerFormValues
}

/**
 * Updates a customer and refreshes both the active list and the affected detail
 * query on success so any open list/detail view reflects the change.
 */
export function useUpdateCustomer(): UseMutationResult<
  Customer,
  Error,
  UpdateCustomerVariables
> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, UpdateCustomerVariables>({
    mutationFn: ({ id, values }) => updateCustomer(client, id, values),
    onSuccess: (_customer, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
    },
  })
}
