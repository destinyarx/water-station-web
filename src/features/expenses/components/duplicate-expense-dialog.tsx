'use client'

import { toFormValues } from '../expenses.mapper'
import type { Expense, ExpenseFormValues } from '../expenses.types'
import { useCreateExpense } from '../hooks/use-create-expense'
import { ExpenseFormDialog } from './expense-form-dialog'

interface DuplicateExpenseDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DuplicateExpenseDialog({
  expense,
  open,
  onOpenChange,
}: DuplicateExpenseDialogProps) {
  const mutation = useCreateExpense()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleSubmit(values: ExpenseFormValues) {
    mutation.mutate(values, { onSuccess: () => handleOpenChange(false) })
  }

  const defaults: ExpenseFormValues = {
    ...toFormValues(expense),
    name: `${expense.name} (copy)`,
  }

  return (
    <ExpenseFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Duplicate expense"
      description="Save a copy as a new expense."
      defaultValues={defaults}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      submitLabel="Save copy"
      pendingLabel="Saving..."
    />
  )
}
