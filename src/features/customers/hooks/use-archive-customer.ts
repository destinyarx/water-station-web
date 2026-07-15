'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { customerKeys } from '../customers.keys'
import { archiveCustomer } from '../services/customers.service'

export function useArchiveCustomer(): UseMutationResult<void, Error, number> {
  return useEntityMutation({
    mutationFn: (client, id) => archiveCustomer(client, id),
    invalidateKeys: [
      customerKeys.lists(),
      customerKeys.stats(),
      customerKeys.options(),
    ],
    successMessage: 'Customer archived.',
  })
}
