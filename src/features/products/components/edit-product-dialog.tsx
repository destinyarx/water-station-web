'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: EditProductDialogProps) {
  const [pendingValues, setPendingValues] = useState<ProductFormValues | null>(
    null,
  )
  const mutation = useUpdateProduct()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      mutation.reset()
      setPendingValues(null)
    }
  }

  function handleSubmit(values: ProductFormValues) {
    setPendingValues(values)
  }

  function handleConfirm() {
    if (!pendingValues) return

    mutation.mutate(
      { id: product.id, values: pendingValues },
      {
        onSuccess: () => {
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
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        submitLabel="Save Changes"
        pendingLabel="Saving..."
      />
      <Dialog
        open={pendingValues != null}
        onOpenChange={(next) => {
          if (!next && !mutation.isPending) setPendingValues(null)
        }}
      >
        <DialogContent className="border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
              Save product changes?
            </DialogTitle>
            <DialogDescription className="text-[#2a4b6a]">
              This will update product information used in your water station
              records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setPendingValues(null)}
              className="rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={handleConfirm}
              className="rounded-xl bg-[#00b4d8] text-white hover:bg-[#009ec2]"
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
