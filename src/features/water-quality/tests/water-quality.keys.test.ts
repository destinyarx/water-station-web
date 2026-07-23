import { describe, expect, it } from 'vitest'

import { waterQualityKeys, type WaterQualityFilters } from '../water-quality.keys'

const filters: WaterQualityFilters = {
  search: '',
  method: 'all',
  status: 'all',
  page: 1,
  perPage: 20,
}

describe('waterQualityKeys', () => {
  it('produces stable array keys', () => {
    expect(waterQualityKeys.all).toEqual(['water-quality'])
    expect(waterQualityKeys.lists()).toEqual(['water-quality', 'list'])
    expect(waterQualityKeys.stats()).toEqual(['water-quality', 'stats'])
    expect(waterQualityKeys.detail(7)).toEqual([
      'water-quality',
      'detail',
      7,
    ])
  })

  it('scopes a list key by its filters', () => {
    expect(waterQualityKeys.list(filters)).toEqual([
      'water-quality',
      'list',
      filters,
    ])
  })
})
