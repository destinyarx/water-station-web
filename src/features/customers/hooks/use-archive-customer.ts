'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'

import { archiveCustomer } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import { useClerkSupabase } from './use-clerk-supabase'

/**
 * Archives (soft-deletes) a customer and refreshes the active list on success
 * so the archived row drops out of the table without a full page reload.
 */
export function useArchiveCustomer(): UseMutationResult<void, Error, number> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id) => archiveCustomer(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
