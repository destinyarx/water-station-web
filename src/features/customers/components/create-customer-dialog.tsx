'use client'

import { useCreateCustomer } from '../hooks/use-create-customer'
import type { CustomerFormValues } from '../customers.types'
import { useMutationDialog } from '../hooks/use-mutation-dialog'
import { CustomerFormDialog } from './customer-form-dialog'

interface CreateCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create form modal for a new customer. Controlled by the page. */
export function CreateCustomerDialog({ open, onOpenChange }: CreateCustomerDialogProps) {
  const mutation = useCreateCustomer()
  const dialog = useMutationDialog<CustomerFormValues>(mutation, {
    open,
    onOpenChange,
  })

  return (
    <CustomerFormDialog
      open={dialog.open}
      onOpenChange={dialog.onOpenChange}
      title="Add customer"
      description="Record a new customer for your station."
      onSubmit={dialog.submit}
      isPending={dialog.isPending}
      errorMessage={dialog.errorMessage}
      submitLabel="Save customer"
      pendingLabel="Saving..."
    />
  )
}
