'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { waterQualityKeys } from '../water-quality.keys'
import { updateTest } from '../services/water-quality.service'
import type {
  WaterQualityTest,
  WaterQualityWriteInput,
} from '../water-quality.types'
import { useWaterQualityOwner } from './use-water-quality-owner'

export interface UpdateWaterQualityTestInput {
  id: number
  input: WaterQualityWriteInput
}

/** Updates a water quality test and mirrors any newly added attachments. */
export function useUpdateWaterQualityTest(): UseMutationResult<
  WaterQualityTest,
  Error,
  UpdateWaterQualityTestInput
> {
  const owner = useWaterQualityOwner()

  return useEntityMutation({
    mutationFn: (client, { id, input }: UpdateWaterQualityTestInput) => {
      if (!owner) {
        throw new Error('Your station context is missing. Please sign in again.')
      }
      return updateTest(client, id, input, owner)
    },
    invalidateKeys: (result) => [
      waterQualityKeys.lists(),
      waterQualityKeys.stats(),
      waterQualityKeys.detail(result.id),
    ],
    successMessage: 'Changes saved.',
  })
}
