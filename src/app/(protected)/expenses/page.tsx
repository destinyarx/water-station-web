import { ExpensesPage } from '@/features/expenses'

// Expense data is auth-dependent; never statically prerender it.
export const dynamic = 'force-dynamic'

export default function Expenses() {
  return <ExpensesPage />
}
