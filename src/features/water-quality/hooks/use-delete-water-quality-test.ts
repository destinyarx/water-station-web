'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { waterQualityKeys } from '../water-quality.keys'
import { deleteTest } from '../services/water-quality.service'

/** Soft-deletes a water quality test by id. */
export function useDeleteWaterQualityTest(): UseMutationResult<
  void,
  Error,
  number
> {
  return useEntityMutation({
    mutationFn: (client, id: number) => deleteTest(client, id),
    invalidateKeys: [waterQualityKeys.lists(), waterQualityKeys.stats()],
    successMessage: 'Water quality test deleted.',
  })
}
