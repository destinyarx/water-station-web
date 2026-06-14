'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCreateCustomer } from '../hooks/use-create-customer'
import type { CustomerFormValues } from '../customers.types'
import { CustomerFormDialog } from './customer-form-dialog'

/** "Add customer" entry point plus the create form modal. */
export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false)
  const mutation = useCreateCustomer()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleSubmit(values: CustomerFormValues) {
    mutation.mutate(values, {
      onSuccess: () => handleOpenChange(false),
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-11 rounded-xl bg-[#00b4d8] px-4 font-semibold text-white shadow-[0_12px_30px_rgba(0,180,216,0.28)] hover:bg-[#009ec2]"
      >
        <Plus className="size-4" />
        Add customer
      </Button>
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
    </>
  )
}
