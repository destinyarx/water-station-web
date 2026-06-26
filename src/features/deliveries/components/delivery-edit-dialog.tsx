'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Product } from '@/features/products/products.types'
import type { Delivery } from '../deliveries.types'
import { useUpdateDelivery } from '../hooks/use-update-delivery'
import { DeliveryEditForm } from './delivery-edit-form'

interface DeliveryEditDialogProps {
  delivery: Delivery | null
  products: Product[]
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function DeliveryEditDialog({
  delivery,
  products,
  onOpenChange,
  onSaved,
}: DeliveryEditDialogProps) {
  const mutation = useUpdateDelivery()

  function handleOpenChange(next: boolean) {
    if (!next) mutation.reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={delivery != null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
            Edit delivery
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            Update the date, items, and notes for this pending delivery run.
          </DialogDescription>
        </DialogHeader>
        {delivery ? (
          <DeliveryEditForm
            delivery={delivery}
            products={products}
            isPending={mutation.isPending}
            errorMessage={mutation.isError ? mutation.error.message : undefined}
            onCancel={() => handleOpenChange(false)}
            onSubmit={(values) =>
              mutation.mutate(
                { deliveryId: delivery.id, values },
                {
                  onSuccess: () => {
                    handleOpenChange(false)
                    onSaved?.()
                  },
                },
              )
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
