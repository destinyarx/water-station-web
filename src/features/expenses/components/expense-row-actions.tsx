'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { Expense } from '../expenses.types'
import { DeleteExpenseDialog } from './delete-expense-dialog'
import { DuplicateExpenseDialog } from './duplicate-expense-dialog'
import { EditExpenseDialog } from './edit-expense-dialog'

export function ExpenseRowActions({ expense }: { expense: Expense }) {
  const [editing, setEditing] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Actions"
            className="h-[34px] w-[34px] rounded-[9px] text-[var(--app-text-soft)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="12" cy="19" r="1.7" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[194px]">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="mr-2 text-[var(--app-brand)]"><path d="M14.5 5.5l4 4M4 20l1-4.2L16 4.8a1.6 1.6 0 0 1 2.2 0l1 1a1.6 1.6 0 0 1 0 2.2L8.2 19 4 20Z" /></svg>
            Edit expense
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDuplicating(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="mr-2 text-[var(--app-text-soft)]"><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M5 16V5a2 2 0 0 1 2-2h9" /></svg>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="mr-2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
            Delete expense
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditExpenseDialog expense={expense} open={editing} onOpenChange={setEditing} />
      <DuplicateExpenseDialog expense={expense} open={duplicating} onOpenChange={setDuplicating} />
      <DeleteExpenseDialog expense={expense} open={deleting} onOpenChange={setDeleting} />
    </>
  )
}
