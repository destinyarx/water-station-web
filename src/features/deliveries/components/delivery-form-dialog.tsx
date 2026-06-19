'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import type { DeliveryFormValues } from '../deliveries.types'
import { DeliveryForm } from './delivery-form'

interface DeliveryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
  products: Product[]
  onSubmit: (values: DeliveryFormValues) => void
  isPending: boolean
  errorMessage?: string
}

export function DeliveryFormDialog({
  open,
  onOpenChange,
  customers,
  products,
  onSubmit,
  isPending,
  errorMessage,
}: DeliveryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
            New one-time delivery
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            Create a dated delivery run for a saved customer or guest recipient.
          </DialogDescription>
        </DialogHeader>
        <DeliveryForm
          customers={customers}
          products={products}
          onSubmit={onSubmit}
          isPending={isPending}
          errorMessage={errorMessage}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
