import { describe, expect, it } from 'vitest'

import { applyLimitPlusOne } from '../deliveries.pagination'

describe('applyLimitPlusOne', () => {
  it('reports a next page and drops the probe row when pageSize + 1 rows arrive', () => {
    const result = applyLimitPlusOne([1, 2, 3, 4, 5, 6], 5)

    expect(result.hasNext).toBe(true)
    expect(result.rows).toEqual([1, 2, 3, 4, 5])
  })

  it('reports no next page when fewer than pageSize + 1 rows arrive', () => {
    const result = applyLimitPlusOne([1, 2, 3], 5)

    expect(result.hasNext).toBe(false)
    expect(result.rows).toEqual([1, 2, 3])
  })

  it('reports no next page when exactly pageSize rows arrive', () => {
    const result = applyLimitPlusOne([1, 2, 3, 4, 5], 5)

    expect(result.hasNext).toBe(false)
    expect(result.rows).toEqual([1, 2, 3, 4, 5])
  })
})
