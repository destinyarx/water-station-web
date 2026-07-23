import type { WaterQualityTest } from './water-quality.types'

export interface WaterQualityActor {
  userId: string
  isOwner: boolean
}

/**
 * Mirrors the verified UPDATE/DELETE policy for UI behavior. Owners/admins may
 * manage any active test in their organization; staff may manage tests they
 * created. RLS remains the authoritative security boundary.
 */
export function canEditWaterQualityTest(
  test: WaterQualityTest,
  actor: WaterQualityActor | null,
): boolean {
  if (!actor || test.deletedAt !== null) return false

  return actor.isOwner || test.createdBy === actor.userId
}

/** Delete authorization matches edit authorization for this feature. */
export function canDeleteWaterQualityTest(
  test: WaterQualityTest,
  actor: WaterQualityActor | null,
): boolean {
  return canEditWaterQualityTest(test, actor)
}
