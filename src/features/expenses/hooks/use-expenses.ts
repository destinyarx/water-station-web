'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { expenseKeys } from '../expenses.keys'
import type { Expense } from '../expenses.types'
import { getActiveExpenses } from '../services/expenses.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useExpenses(): UseQueryResult<Expense[], Error> {
  const client = useClerkSupabase()

  return useQuery<Expense[], Error>({
    queryKey: expenseKeys.list({ active: true }),
    queryFn: () => getActiveExpenses(client),
  })
}
