'use client'

import { SaveConfirmDialog } from '@/components/app/save-confirm-dialog'
import { useSubmitConfirm } from '@/components/app/use-submit-confirm'
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
  const confirm = useSubmitConfirm<CustomerFormValues>()

  function runMutation() {
    if (!confirm.pending) return
    mutation.mutate(
      { id: customer.id, values: confirm.pending },
      {
        onSuccess: () => {
          confirm.reset()
          dialog.onOpenChange(false)
        },
      },
    )
  }

  return (
    <>
      <CustomerFormDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        title="Edit customer"
        description="Update this customer's contact and address details."
        defaultValues={toFormValues(customer)}
        onSubmit={confirm.request}
        isPending={dialog.isPending}
        errorMessage={dialog.errorMessage}
        submitLabel="Save changes"
        pendingLabel="Saving..."
      />
      <SaveConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(next) => {
          if (!next) {
            confirm.reset()
            mutation.reset()
          }
        }}
        mode="update"
        entityLabel="customer"
        isPending={mutation.isPending}
        errorMessage={dialog.errorMessage}
        onConfirm={runMutation}
      />
    </>
  )
}
