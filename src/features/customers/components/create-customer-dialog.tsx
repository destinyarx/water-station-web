'use client'

import { SaveConfirmDialog } from '@/components/app/save-confirm-dialog'
import { useSubmitConfirm } from '@/components/app/use-submit-confirm'
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
  const confirm = useSubmitConfirm<CustomerFormValues>()

  function runMutation() {
    if (!confirm.pending) return
    mutation.mutate(confirm.pending, {
      onSuccess: () => {
        confirm.reset()
        dialog.onOpenChange(false)
      },
    })
  }

  return (
    <>
      <CustomerFormDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        title="Add customer"
        description="Record a new customer for your station."
        onSubmit={confirm.request}
        isPending={dialog.isPending}
        errorMessage={dialog.errorMessage}
        submitLabel="Save customer"
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
        mode="create"
        entityLabel="customer"
        isPending={mutation.isPending}
        errorMessage={dialog.errorMessage}
        onConfirm={runMutation}
      />
    </>
  )
}
