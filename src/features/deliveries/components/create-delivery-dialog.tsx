'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import type { DeliveryFormValues } from '../deliveries.types'
import { useCreateDelivery } from '../hooks/use-create-delivery'
import { DeliveryFormDialog } from './delivery-form-dialog'

interface CreateDeliveryDialogProps {
  customers: Customer[]
  products: Product[]
  disabled?: boolean
  onCreated?: () => void
}

export function CreateDeliveryDialog({
  customers,
  products,
  disabled = false,
  onCreated,
}: CreateDeliveryDialogProps) {
  const [open, setOpen] = useState(false)
  const mutation = useCreateDelivery()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleSubmit(values: DeliveryFormValues) {
    mutation.mutate(values, {
      onSuccess: () => {
        handleOpenChange(false)
        onCreated?.()
      },
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="h-11 rounded-xl bg-[#00b4d8] px-4 font-semibold text-white shadow-[0_12px_30px_rgba(0,180,216,0.28)] hover:bg-[#009ec2]"
      >
        <Plus className="size-4" />
        New Delivery
      </Button>
      <DeliveryFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        customers={customers}
        products={products}
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
      />
    </>
  )
}
