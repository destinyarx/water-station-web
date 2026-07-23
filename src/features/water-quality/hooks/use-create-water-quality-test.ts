'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { useEntityMutation } from '@/hooks/use-entity-mutation'

import { waterQualityKeys } from '../water-quality.keys'
import { createTest } from '../services/water-quality.service'
import type {
  WaterQualityTest,
  WaterQualityWriteInput,
} from '../water-quality.types'
import { useWaterQualityOwner } from './use-water-quality-owner'

/** Creates a water quality test using trusted Clerk tenant/creator context. */
export function useCreateWaterQualityTest(): UseMutationResult<
  WaterQualityTest,
  Error,
  WaterQualityWriteInput
> {
  const owner = useWaterQualityOwner()

  return useEntityMutation({
    mutationFn: (client, input: WaterQualityWriteInput) => {
      if (!owner) {
        throw new Error('Your station context is missing. Please sign in again.')
      }
      return createTest(client, input, owner)
    },
    invalidateKeys: [waterQualityKeys.lists(), waterQualityKeys.stats()],
    successMessage: 'Water quality test saved.',
  })
}
