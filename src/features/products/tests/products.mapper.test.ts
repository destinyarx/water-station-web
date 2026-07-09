import { describe, expect, it } from 'vitest'

import { toFormValues, toInsertRow, toProduct, toUpdateRow } from '../products.mapper'
import type { ProductFormValues, ProductRow } from '../products.types'

const row: ProductRow = {
  id: 42,
  product_name: 'Bottled Water 500ml',
  price: 15,
  is_stock_tracked: true,
  stock: 120,
  descriptions: 'Retail bottle',
  is_active: true,
  org_id: '00000000-0000-4000-8000-000000000007',
  created_by: 'user_2abcDEF',
  created_at: '2026-06-13T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

const values: ProductFormValues = {
  productName: ' Bottled Water 500ml ',
  price: 15,
  isStockTracked: true,
  stock: 120,
  description: ' Retail bottle ',
}

describe('toProduct', () => {
  it('maps snake_case product columns to the display model', () => {
    const product = toProduct(row)

    expect(product).toMatchObject({
      id: 42,
      productName: 'Bottled Water 500ml',
      isStockTracked: true,
      orgId: '00000000-0000-4000-8000-000000000007',
      createdBy: 'user_2abcDEF',
      deletedAt: null,
    })
  })
})

describe('toInsertRow', () => {
  it('sets tenant and creator from the resolved owner', () => {
    const insert = toInsertRow(values, {
      orgId: '00000000-0000-4000-8000-000000000007',
      createdBy: 'user_2abcDEF',
    })

    expect(insert).toMatchObject({
      product_name: 'Bottled Water 500ml',
      org_id: '00000000-0000-4000-8000-000000000007',
      created_by: 'user_2abcDEF',
      descriptions: 'Retail bottle',
    })
  })

  it('stores zero stock for non-stock-tracked products', () => {
    const insert = toInsertRow(
      { ...values, isStockTracked: false, stock: 40 },
      { orgId: '00000000-0000-4000-8000-000000000007', createdBy: 'user_2abcDEF' },
    )

    expect(insert.stock).toBe(0)
  })
})

describe('toUpdateRow', () => {
  it('omits immutable ownership fields and stamps updated_at', () => {
    const update = toUpdateRow(values)

    expect(Object.keys(update)).not.toContain('org_id')
    expect(Object.keys(update)).not.toContain('created_by')
    expect(update.updated_at).toEqual(expect.any(String))
  })
})

describe('toFormValues', () => {
  it('maps a product back to editable form values', () => {
    const formValues = toFormValues(toProduct(row))

    expect(formValues).toEqual({
      productName: 'Bottled Water 500ml',
      price: 15,
      isStockTracked: true,
      stock: 120,
      description: 'Retail bottle',
    })
  })
})
