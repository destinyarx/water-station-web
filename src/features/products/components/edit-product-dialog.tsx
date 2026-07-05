'use client'

import { SaveConfirmDialog } from '@/components/app/save-confirm-dialog'
import { useSubmitConfirm } from '@/components/app/use-submit-confirm'
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
  const confirm = useSubmitConfirm<ProductFormValues>()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function runMutation() {
    if (!confirm.pending) return
    mutation.mutate(
      { id: product.id, values: confirm.pending },
      {
        onSuccess: () => {
          confirm.reset()
          handleOpenChange(false)
          onUpdated?.()
        },
      },
    )
  }

  return (
    <>
      <ProductFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Edit product"
        description="Update product information used across water station records."
        defaultValues={toFormValues(product)}
        onSubmit={confirm.request}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
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
        entityLabel="product"
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onConfirm={runMutation}
      />
    </>
  )
}
