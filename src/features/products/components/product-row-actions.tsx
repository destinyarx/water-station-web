'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { canManageProduct, type ProductActor } from '../products.guards'
import type { Product } from '../products.types'
import { DeleteProductDialog } from './delete-product-dialog'
import { EditProductDialog } from './edit-product-dialog'

interface ProductRowActionsProps {
  product: Product
  actor: ProductActor | null
  onActionSuccess?: (message: string) => void
}

export function ProductRowActions({
  product,
  actor,
  onActionSuccess,
}: ProductRowActionsProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canManage = canManageProduct(product, actor)

  if (!canManage) {
    return (
      <span className="text-xs font-medium text-[#6d797e]">
        View only
      </span>
    )
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="rounded-lg border-[#bdefff] bg-white text-[#00677d] hover:bg-[#eef7ff] hover:text-[#00414f]"
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setDeleting(true)}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>
      <EditProductDialog
        product={product}
        open={editing}
        onOpenChange={setEditing}
        onUpdated={() => onActionSuccess?.('Product updated successfully.')}
      />
      <DeleteProductDialog
        product={product}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={() => onActionSuccess?.('Product deleted successfully.')}
      />
    </div>
  )
}
