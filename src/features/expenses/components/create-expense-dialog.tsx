'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ExpenseFormValues } from '../expenses.types'
import { useCreateExpense } from '../hooks/use-create-expense'
import { ExpenseFormDialog } from './expense-form-dialog'

export function CreateExpenseDialog() {
  const [open, setOpen] = useState(false)
  const mutation = useCreateExpense()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleSubmit(values: ExpenseFormValues) {
    mutation.mutate(values, {
      onSuccess: () => handleOpenChange(false),
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-11 rounded-xl bg-[#00b4d8] px-4 font-semibold text-white shadow-[0_12px_30px_rgba(0,180,216,0.28)] hover:bg-[#009ec2]"
      >
        <Plus className="size-4" />
        Add Expense
      </Button>
      <ExpenseFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add expense"
        description="Record a station operating cost."
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        submitLabel="Save expense"
        pendingLabel="Saving..."
      />
    </>
  )
}
