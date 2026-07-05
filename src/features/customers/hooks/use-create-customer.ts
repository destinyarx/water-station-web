'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'

import { createCustomer } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import type { Customer, CustomerFormValues } from '../customers.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'
import { useCustomerOwner } from './use-customer-owner'

/**
 * Creates a customer for the current tenant and refreshes the active list on
 * success. Tenant/creator come from the Clerk session, not form input.
 */
export function useCreateCustomer(): UseMutationResult<
  Customer,
  Error,
  CustomerFormValues
> {
  const client = useClerkSupabase()
  const owner = useCustomerOwner()
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, CustomerFormValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error(
          'Your station context is missing. Please sign in again.',
        )
      }
      return createCustomer(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast.success('Customer added.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
