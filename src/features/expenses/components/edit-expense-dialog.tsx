'use client'

import { SaveConfirmDialog } from '@/components/app/save-confirm-dialog'
import { useSubmitConfirm } from '@/components/app/use-submit-confirm'
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
  const confirm = useSubmitConfirm<ExpenseFormValues>()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      mutation.reset()
    }
  }

  function runMutation() {
    if (!confirm.pending) return
    mutation.mutate(
      { id: expense.id, values: confirm.pending },
      {
        onSuccess: () => {
          confirm.reset()
          handleOpenChange(false)
        },
      },
    )
  }

  return (
    <>
      <ExpenseFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Edit expense"
        description="Update this operating cost."
        defaultValues={toFormValues(expense)}
        onSubmit={confirm.request}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        submitLabel="Save changes"
        pendingLabel="Saving..."
      />
      <SaveConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(next) => {
          if (!next) {
            confirm.reset()
            mutation.reset()
          }
        }}
        mode="update"
        entityLabel="expense"
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onConfirm={runMutation}
      />
    </>
  )
}
