'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Expense } from '../expenses.types'
import { DeleteExpenseDialog } from './delete-expense-dialog'
import { EditExpenseDialog } from './edit-expense-dialog'

export function ExpenseRowActions({ expense }: { expense: Expense }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="rounded-lg border-[#bdefff] bg-white text-[#00677d] hover:bg-[#eef7ff] hover:text-[#00414f]"
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setDeleting(true)}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>
      <EditExpenseDialog
        expense={expense}
        open={editing}
        onOpenChange={setEditing}
      />
      <DeleteExpenseDialog
        expense={expense}
        open={deleting}
        onOpenChange={setDeleting}
      />
    </div>
  )
}
