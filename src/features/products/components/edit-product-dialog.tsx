'use client'

import { toFormValues } from '../products.mapper'
import type { Product, ProductFormValues } from '../products.types'
import { useUpdateProduct } from '../hooks/use-update-product'
import { ProductFormDialog } from './product-form-dialog'

interface EditProductDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

/** Edit form modal for an existing product, seeded from the current record. */
export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: EditProductDialogProps) {
  const mutation = useUpdateProduct()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleSubmit(values: ProductFormValues) {
    mutation.mutate(
      { id: product.id, values },
      {
        onSuccess: () => {
          handleOpenChange(false)
          onUpdated?.()
        },
      },
    )
  }

  return (
    <ProductFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit product"
      description="Update product information used across water station records."
      defaultValues={toFormValues(product)}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      submitLabel="Save changes"
      pendingLabel="Saving..."
    />
  )
}
