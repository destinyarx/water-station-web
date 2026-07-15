'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { customerKeys } from '../customers.keys'
import { updateCustomer } from '../services/customers.service'
import type { Customer, CustomerFormValues } from '../customers.types'

interface UpdateCustomerVariables {
  id: number
  values: CustomerFormValues
}

export function useUpdateCustomer(): UseMutationResult<
  Customer,
  Error,
  UpdateCustomerVariables
> {
  return useEntityMutation({
    mutationFn: (client, { id, values }) => updateCustomer(client, id, values),
    invalidateKeys: (_customer, { id }) => [
      customerKeys.lists(),
      customerKeys.detail(id),
      customerKeys.options(),
    ],
    successMessage: 'Customer updated.',
  })
}
