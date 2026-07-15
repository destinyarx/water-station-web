'use client'

import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query'

import { expenseKeys, type ExpenseFilters } from '../expenses.keys'
import type { ExpensePage } from '../expenses.types'
import type { ExpenseSummary } from '../expenses.summary'
import { getActiveExpenses, getExpenseSummary } from '../services/expenses.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useExpenses(filters: ExpenseFilters): UseQueryResult<ExpensePage, Error> {
  const client = useClerkSupabase()

  return useQuery<ExpensePage, Error>({
    queryKey: expenseKeys.list(filters),
    queryFn: () => getActiveExpenses(client, filters),
    placeholderData: keepPreviousData,
  })
}

export function useExpenseSummary(): UseQueryResult<ExpenseSummary, Error> {
  const client = useClerkSupabase()
  return useQuery({ queryKey: expenseKeys.summary(), queryFn: () => getExpenseSummary(client) })
}
