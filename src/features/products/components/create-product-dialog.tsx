'use client'

import type { ProductFormValues } from '../products.types'
import { useCreateProduct } from '../hooks/use-create-product'
import { ProductFormDialog } from './product-form-dialog'

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

/** Create form modal for a new product. Controlled by the page. */
export function CreateProductDialog({ open, onOpenChange, onCreated }: CreateProductDialogProps) {
  const mutation = useCreateProduct()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleSubmit(values: ProductFormValues) {
    mutation.mutate(values, {
      onSuccess: () => {
        handleOpenChange(false)
        onCreated?.()
      },
    })
  }

  return (
    <ProductFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add product"
      description="Add a refill service, bottled product, container, accessory, or fee."
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      submitLabel="Create product"
      pendingLabel="Creating..."
    />
  )
}
