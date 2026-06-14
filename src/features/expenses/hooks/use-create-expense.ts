'use client'

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'

import { expenseKeys } from '../expenses.keys'
import type { Expense, ExpenseFormValues } from '../expenses.types'
import { createExpense } from '../services/expenses.service'
import { useClerkSupabase } from './use-clerk-supabase'
import { useExpenseOwner } from './use-expense-owner'

export function useCreateExpense(): UseMutationResult<
  Expense,
  Error,
  ExpenseFormValues
> {
  const client = useClerkSupabase()
  const owner = useExpenseOwner()
  const queryClient = useQueryClient()

  return useMutation<Expense, Error, ExpenseFormValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error(
          'Your station context is missing. Please sign in again.',
        )
      }
      return createExpense(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
    },
  })
}
