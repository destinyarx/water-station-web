import { describe, expect, it } from 'vitest'

import { canManageProduct } from '../products.guards'
import type { Product } from '../products.types'

const product: Product = {
  id: 42,
  productName: 'Bottled Water 500ml',
  price: 15,
  isStockTracked: true,
  stock: 120,
  description: null,
  isActive: true,
  orgId: '00000000-0000-4000-8000-000000000007',
  createdBy: 'user_staff',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
}

describe('canManageProduct', () => {
  it('allows staff to manage products they created', () => {
    expect(
      canManageProduct(product, { userId: 'user_staff', isOwner: false }),
    ).toBe(true)
  })

  it('allows owners to manage organization products created by staff', () => {
    expect(
      canManageProduct(product, { userId: 'user_owner', isOwner: true }),
    ).toBe(true)
  })

  it('blocks staff from managing products created by another user', () => {
    expect(
      canManageProduct(product, { userId: 'user_other', isOwner: false }),
    ).toBe(false)
  })

  it('blocks deleted products from row actions', () => {
    expect(
      canManageProduct(
        { ...product, deletedAt: '2026-06-13T01:00:00.000Z' },
        { userId: 'user_owner', isOwner: true },
      ),
    ).toBe(false)
  })
})
