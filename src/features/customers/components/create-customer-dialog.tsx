'use client'

import { useCreateCustomer } from '../hooks/use-create-customer'
import type { CustomerFormValues } from '../customers.types'
import { CustomerFormDialog } from './customer-form-dialog'

interface CreateCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create form modal for a new customer. Controlled by the page. */
export function CreateCustomerDialog({ open, onOpenChange }: CreateCustomerDialogProps) {
  const mutation = useCreateCustomer()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleSubmit(values: CustomerFormValues) {
    mutation.mutate(values, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <CustomerFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add customer"
      description="Record a new customer for your station."
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      submitLabel="Save customer"
      pendingLabel="Saving..."
    />
  )
}
