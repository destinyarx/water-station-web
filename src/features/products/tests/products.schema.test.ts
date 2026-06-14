import { describe, expect, it } from 'vitest'

import { productFormSchema } from '../products.schema'

describe('productFormSchema', () => {
  it('accepts a valid stock-tracked product', () => {
    const result = productFormSchema.parse({
      productName: ' Bottled Water 500ml ',
      price: '15',
      isStockTracked: true,
      stock: '120',
      description: ' Retail bottle ',
    })

    expect(result).toEqual({
      productName: 'Bottled Water 500ml',
      price: 15,
      isStockTracked: true,
      stock: 120,
      description: 'Retail bottle',
    })
  })

  it('normalizes non-stock-tracked products to zero stock', () => {
    const result = productFormSchema.parse({
      productName: '5 Gallon Water Refill',
      price: 35,
      isStockTracked: false,
      stock: undefined,
      description: '',
    })

    expect(result.stock).toBe(0)
  })

  it('requires stock when stock tracking is enabled', () => {
    const result = productFormSchema.safeParse({
      productName: 'Slim Container',
      price: 180,
      isStockTracked: true,
      description: '',
    })

    expect(result.success).toBe(false)
  })

  it('rejects negative price and negative stock', () => {
    const result = productFormSchema.safeParse({
      productName: 'Container Cap',
      price: -1,
      isStockTracked: true,
      stock: -2,
      description: '',
    })

    expect(result.success).toBe(false)
  })
})
