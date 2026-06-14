'use client'

import { useUpdateCustomer } from '../hooks/use-update-customer'
import { toFormValues } from '../customers.mapper'
import type { Customer, CustomerFormValues } from '../customers.types'
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

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleSubmit(values: CustomerFormValues) {
    mutation.mutate(
      { id: customer.id, values },
      { onSuccess: () => handleOpenChange(false) }
    )
  }

  return (
    <CustomerFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit customer"
      description="Update this customer's contact and address details."
      defaultValues={toFormValues(customer)}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      submitLabel="Save changes"
      pendingLabel="Saving..."
    />
  )
}
