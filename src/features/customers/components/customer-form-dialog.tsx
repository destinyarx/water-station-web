'use client'

import { AppModal } from '@/components/app/app-modal'
import { CustomerForm } from './customer-form'
import type { CustomerFormValues } from '../customers.types'

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: CustomerFormValues
  onSubmit: (values: CustomerFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

/**
 * Custom modal shell around `CustomerForm`, matching the AquaFlow design. Pure
 * presentation: the create/edit wrappers own their mutations and pass results
 * in. A fresh `key` per open resets the form's internal state between opens.
 */
export function CustomerFormDialog({
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
}: CustomerFormDialogProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="2xl"
      bodyPadding="22px 26px"
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" />
        </svg>
      }
    >
      <CustomerForm
        key={open ? 'open' : 'closed'}
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
