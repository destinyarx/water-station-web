'use client'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { Expense } from '../expenses.types'
import { useSoftDeleteExpense } from '../hooks/use-soft-delete-expense'

interface DeleteExpenseDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteExpenseDialog({ expense, open, onOpenChange }: DeleteExpenseDialogProps) {
  const mutation = useSoftDeleteExpense()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleConfirm() {
    mutation.mutate(expense.id, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant="destructive"
      title="Delete this expense?"
      description={
        <>
          &ldquo;{expense.name}&rdquo; will be removed from your records and reports.
        </>
      }
      confirmLabel="Yes, delete"
      pendingLabel="Deleting..."
      onConfirm={handleConfirm}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
    />
  )
}
