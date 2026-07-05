'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setCustomerStatus } from '../services/customers.service'
import { customerKeys } from '../customers.keys'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

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
    onSuccess: (_data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast.success(isActive ? 'Customer set as active.' : 'Customer set as inactive.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
