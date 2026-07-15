'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'

import { expenseKeys } from '../expenses.keys'
import { softDeleteExpense } from '../services/expenses.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useSoftDeleteExpense(): UseMutationResult<void, Error, number> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id) => softDeleteExpense(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      toast.success('Expense deleted.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
