'use client'

import { toFormValues } from '../expenses.mapper'
import type { Expense, ExpenseFormValues } from '../expenses.types'
import { useUpdateExpense } from '../hooks/use-update-expense'
import { ExpenseFormDialog } from './expense-form-dialog'

interface EditExpenseDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
}: EditExpenseDialogProps) {
  const mutation = useUpdateExpense()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleSubmit(values: ExpenseFormValues) {
    mutation.mutate(
      { id: expense.id, values },
      { onSuccess: () => handleOpenChange(false) },
    )
  }

  return (
    <ExpenseFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit expense"
      description="Update this operating cost."
      defaultValues={toFormValues(expense)}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      submitLabel="Save changes"
      pendingLabel="Saving..."
    />
  )
}
