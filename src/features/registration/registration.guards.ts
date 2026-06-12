import type { RegistrationSessionClaims } from './registration.types'

/**
 * A user is registered iff the edge function has written BOTH the
 * `organization` and `is_owner` claims into their Clerk session token.
 * Until then, middleware gates them to `/complete-registration`.
 */
export function isRegistered(
  sessionClaims: RegistrationSessionClaims | null | undefined,
): boolean {
  return sessionClaims?.organization != null && sessionClaims?.is_owner != null
}
