'use client'

import type { Product } from '../products.types'
import { useSoftDeleteProduct } from '../hooks/use-soft-delete-product'
import { ConfirmDialog } from '@/components/app/confirm-dialog'

interface DeleteProductDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProductDialogProps) {
  const mutation = useSoftDeleteProduct()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleConfirm() {
    mutation.mutate(product.id, {
      onSuccess: () => {
        handleOpenChange(false)
        onDeleted?.()
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant="destructive"
      title={<>Delete &ldquo;{product.productName}&rdquo;?</>}
      description="This product will be removed from your catalog. It is kept for your records and can no longer be sold or delivered."
      confirmLabel="Yes, delete"
      pendingLabel="Deleting..."
      onConfirm={handleConfirm}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
    />
  )
}
