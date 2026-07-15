import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { invalidateEntityMutationKeys } from './use-entity-mutation'

describe('invalidateEntityMutationKeys', () => {
  it('invalidates every declared query key without widening its scope', () => {
    const queryClient = new QueryClient()
    const invalidate = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue()

    invalidateEntityMutationKeys(queryClient, [
      ['customers', 'list'],
      ['customers', 'detail', 42],
    ])

    expect(invalidate).toHaveBeenNthCalledWith(1, {
      queryKey: ['customers', 'list'],
    })
    expect(invalidate).toHaveBeenNthCalledWith(2, {
      queryKey: ['customers', 'detail', 42],
    })
  })
})
