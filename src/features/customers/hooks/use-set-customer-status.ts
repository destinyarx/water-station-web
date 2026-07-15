'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { customerKeys } from '../customers.keys'
import { setCustomerStatus } from '../services/customers.service'

interface SetCustomerStatusInput {
  id: number
  isActive: boolean
}

export function useSetCustomerStatus(): UseMutationResult<
  void,
  Error,
  SetCustomerStatusInput
> {
  return useEntityMutation({
    mutationFn: (client, { id, isActive }) =>
      setCustomerStatus(client, id, isActive),
    invalidateKeys: [customerKeys.lists(), customerKeys.options()],
    successMessage: (_result, { isActive }) =>
      isActive ? 'Customer set as active.' : 'Customer set as inactive.',
  })
}
