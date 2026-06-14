import type { Product } from './products.types'

export interface ProductActor {
  userId: string
  isOwner: boolean
}

export function canManageProduct(
  product: Product,
  actor: ProductActor | null,
): boolean {
  if (!actor || product.deletedAt != null) {
    return false
  }

  return actor.isOwner || product.createdBy === actor.userId
}
