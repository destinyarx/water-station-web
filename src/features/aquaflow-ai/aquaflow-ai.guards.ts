/**
 * AquaFlow AI is owner-only. Access requires a registered session whose
 * `is_owner` claim is true. This is the shared check behind both the nav hide
 * and the server-side route guard. See docs/adr/0008.
 */
export function canAccessAquaflowAi(
  sessionClaims: { organization?: string | null; is_owner?: boolean | null } | null | undefined,
): boolean {
  return sessionClaims?.organization != null && sessionClaims?.is_owner === true
}
