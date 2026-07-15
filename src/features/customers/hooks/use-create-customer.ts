'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { customerKeys } from '../customers.keys'
import { createCustomer } from '../services/customers.service'
import type { Customer, CustomerFormValues } from '../customers.types'
import { useCustomerOwner } from './use-customer-owner'

/** Creates a customer using trusted Clerk tenant/creator context. */
export function useCreateCustomer(): UseMutationResult<
  Customer,
  Error,
  CustomerFormValues
> {
  const owner = useCustomerOwner()

  return useEntityMutation({
    mutationFn: (client, values) => {
      if (!owner) {
        throw new Error('Your station context is missing. Please sign in again.')
      }
      return createCustomer(client, values, owner)
    },
    invalidateKeys: [
      customerKeys.lists(),
      customerKeys.stats(),
      customerKeys.options(),
    ],
    successMessage: 'Customer added.',
  })
}
