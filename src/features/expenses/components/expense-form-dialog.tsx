'use client'

import { AppModal } from '@/components/app/app-modal'
import type { ExpenseFormValues } from '../expenses.types'
import { ExpenseForm } from './expense-form'

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: ExpenseFormValues
  onSubmit: (values: ExpenseFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
}: ExpenseFormDialogProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="3xl"
      bodyPadding="22px 26px"
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2.5" />
          <path d="M3 10h18" />
        </svg>
      }
    >
      <ExpenseForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isPending={isPending}
        errorMessage={errorMessage}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        onCancel={() => onOpenChange(false)}
      />
    </AppModal>
  )
}
