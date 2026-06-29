'use client'

import { useUpdateCustomer } from '../hooks/use-update-customer'
import { toFormValues } from '../customers.mapper'
import type { Customer, CustomerFormValues } from '../customers.types'
import { useMutationDialog } from '../hooks/use-mutation-dialog'
import { CustomerFormDialog } from './customer-form-dialog'

interface EditCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Edit form modal for an existing customer, seeded from the current record. */
export function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
}: EditCustomerDialogProps) {
  const mutation = useUpdateCustomer()
  const dialog = useMutationDialog(mutation, { open, onOpenChange })

  function handleSubmit(values: CustomerFormValues) {
    dialog.submit({ id: customer.id, values })
  }

  return (
    <CustomerFormDialog
      open={dialog.open}
      onOpenChange={dialog.onOpenChange}
      title="Edit customer"
      description="Update this customer's contact and address details."
      defaultValues={toFormValues(customer)}
      onSubmit={handleSubmit}
      isPending={dialog.isPending}
      errorMessage={dialog.errorMessage}
      submitLabel="Save changes"
      pendingLabel="Saving..."
    />
  )
}
