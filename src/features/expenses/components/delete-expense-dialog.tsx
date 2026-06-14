'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Expense } from '../expenses.types'
import { useSoftDeleteExpense } from '../hooks/use-soft-delete-expense'

interface DeleteExpenseDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteExpenseDialog({
  expense,
  open,
  onOpenChange,
}: DeleteExpenseDialogProps) {
  const mutation = useSoftDeleteExpense()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleConfirm() {
    mutation.mutate(expense.id, {
      onSuccess: () => handleOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
            Delete expense
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            Delete <span className="font-medium">{expense.name}</span>? It will
            be hidden from the active expenses list.
          </DialogDescription>
        </DialogHeader>

        {mutation.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {mutation.error.message}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => handleOpenChange(false)}
            className="rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleConfirm}
            className="rounded-xl"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
