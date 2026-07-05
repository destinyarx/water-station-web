'use client'

import { SaveConfirmDialog } from '@/components/app/save-confirm-dialog'
import { useSubmitConfirm } from '@/components/app/use-submit-confirm'
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
  const confirm = useSubmitConfirm<ProductFormValues>()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function runMutation() {
    if (!confirm.pending) return
    mutation.mutate(confirm.pending, {
      onSuccess: () => {
        confirm.reset()
        handleOpenChange(false)
        onCreated?.()
      },
    })
  }

  return (
    <>
      <ProductFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add product"
        description="Add a refill service, bottled product, container, accessory, or fee."
        onSubmit={confirm.request}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        submitLabel="Create product"
        pendingLabel="Creating..."
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
        entityLabel="product"
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onConfirm={runMutation}
      />
    </>
  )
}
