'use client'

import { useState } from 'react'

import type { ExpenseFormValues } from '../expenses.types'
import { useCreateExpense } from '../hooks/use-create-expense'
import { ExpenseFormDialog } from './expense-form-dialog'

export function CreateExpenseDialog() {
  const [open, setOpen] = useState(false)
  const mutation = useCreateExpense()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) mutation.reset()
  }

  function handleSubmit(values: ExpenseFormValues) {
    mutation.mutate(values, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 whitespace-nowrap inline-flex items-center gap-[9px] bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] text-white border-none font-[inherit] text-md font-semibold py-3 px-[21px] rounded-xl cursor-pointer shadow-[0_10px_22px_rgba(14,108,196,0.28)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Record expense
      </button>

      <ExpenseFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Record expense"
        description="Log a new cost for your station."
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        submitLabel="Save expense"
        pendingLabel="Saving..."
      />
    </>
  )
}
