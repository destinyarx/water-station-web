'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
 * Modal shell around `CustomerForm`. Stateless about persistence; the create
 * and edit wrappers own their mutations and pass results in.
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isPending={isPending}
          errorMessage={errorMessage}
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
