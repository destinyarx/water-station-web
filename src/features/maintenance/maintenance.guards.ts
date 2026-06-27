/**
 * Only the station owner may archive (soft-delete) a maintenance schedule —
 * mirrors the deliveries rule and the DB policy. Any org member may still edit,
 * complete, and toggle active/inactive (shared org queue).
 */
export function canArchiveSchedule(isOwner: boolean): boolean {
  return isOwner
}
