import type { RegistrationSessionClaims } from './registration.types'

/**
 * A user is registered iff an onboarding edge function has written BOTH the
 * `organization` (the `organizations.id` uuid) and `is_owner` claims into their
 * Clerk `public_metadata`. Until then, middleware gates them to
 * `/complete-registration`.
 */
export function isRegistered(
  sessionClaims: RegistrationSessionClaims | null | undefined,
): boolean {
  return sessionClaims?.organization != null && sessionClaims?.is_owner != null
}
