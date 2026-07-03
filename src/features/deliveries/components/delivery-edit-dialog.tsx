'use client'

import { AppModal } from '@/components/app/app-modal'
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

const EDIT_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

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
    <AppModal
      open={delivery != null}
      onOpenChange={handleOpenChange}
      title="Edit delivery"
      description="Update the date, items, and notes for this pending delivery run."
      icon={EDIT_ICON}
      maxWidth="700px"
      bodyPadding="22px 26px"
    >
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
    </AppModal>
  )
}
