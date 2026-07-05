'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'

import { expenseKeys } from '../expenses.keys'
import type { Expense, ExpenseFormValues } from '../expenses.types'
import { updateExpense } from '../services/expenses.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

interface UpdateExpenseVariables {
  id: number
  values: ExpenseFormValues
}

export function useUpdateExpense(): UseMutationResult<
  Expense,
  Error,
  UpdateExpenseVariables
> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Expense, Error, UpdateExpenseVariables>({
    mutationFn: ({ id, values }) => updateExpense(client, id, values),
    onSuccess: (_expense, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) })
      toast.success('Expense updated.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
