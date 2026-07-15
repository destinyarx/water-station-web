import { describe, expect, it } from 'vitest'

import { productKeys } from '../products.keys'

describe('productKeys', () => {
  it('uses array query keys for product lists and details', () => {
    expect(productKeys.all).toEqual(['products'])
    expect(productKeys.lists()).toEqual(['products', 'list'])
    expect(productKeys.list({ deleted: false, search: '', category: 'all', page: 1, perPage: 10 })).toEqual([
      'products',
      'list',
      { deleted: false, search: '', category: 'all', page: 1, perPage: 10 },
    ])
    expect(productKeys.detail(42)).toEqual(['products', 'detail', 42])
  })
})
