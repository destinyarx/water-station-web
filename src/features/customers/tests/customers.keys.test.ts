import { describe, it, expect } from 'vitest'
import { customerKeys } from '../customers.keys'

describe('customerKeys', () => {
  it('exposes the base key as an array', () => {
    expect(customerKeys.all).toEqual(['customers'])
  })

  it('derives the list key from the base key', () => {
    expect(customerKeys.lists()).toEqual(['customers', 'list'])
  })

  it('includes filters in a scoped list key', () => {
    expect(customerKeys.list({ archived: false })).toEqual([
      'customers',
      'list',
      { archived: false },
    ])
  })

  it('derives a detail key that includes the id', () => {
    expect(customerKeys.detail(42)).toEqual(['customers', 'detail', 42])
  })
})
