'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ProductFormValues } from '../products.types'
import { useCreateProduct } from '../hooks/use-create-product'
import { ProductFormDialog } from './product-form-dialog'

interface CreateProductDialogProps {
  onCreated?: () => void
}

export function CreateProductDialog({ onCreated }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false)
  const mutation = useCreateProduct()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      mutation.reset()
    }
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
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-11 rounded-xl bg-[#00b4d8] px-4 font-semibold text-white shadow-[0_12px_30px_rgba(0,180,216,0.28)] hover:bg-[#009ec2]"
      >
        <Plus className="size-4" />
        Add Product
      </Button>
      <ProductFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add product"
        description="Add a refill service, bottled product, container, accessory, or fee."
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        submitLabel="Create Product"
        pendingLabel="Creating..."
      />
    </>
  )
}
