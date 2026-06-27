'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setCustomerStatus } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import { useClerkSupabase } from './use-clerk-supabase'

interface SetCustomerStatusInput {
  id: number
  isActive: boolean
}

/** Marks a customer active/inactive and refreshes the directory on success. */
export function useSetCustomerStatus() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, SetCustomerStatusInput>({
    mutationFn: ({ id, isActive }) => setCustomerStatus(client, id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
