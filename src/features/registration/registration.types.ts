import type { z } from 'zod'
import type { registrationSchema } from './registration.schema'

export type RegistrationInput = z.infer<typeof registrationSchema>

/** Profile fields taken from the Clerk session and forwarded to the edge fn. */
export interface RegistrationIdentity {
  name: string
  email: string
}

/** Body posted to `create-aquaflow-organization` (owner). */
export interface OwnerRegistrationPayload {
  organization_name: string
  name: string
  email: string
}

/** Body posted to `aquaflow-add-staff` (staff). */
export interface StaffRegistrationPayload {
  organization_code: string
  contact_number: string
  name: string
  email: string
}

/** The resolved edge-function call: which URL and what body to post. */
export interface RegistrationRequest {
  url: string
  body: OwnerRegistrationPayload | StaffRegistrationPayload
}

/**
 * Shape of the Clerk session-token custom claims this app relies on.
 * Sourced from `public_metadata`, flattened to top-level claims. `organization`
 * is the `organizations.id` uuid.
 */
export interface RegistrationSessionClaims {
  organization?: string | null
  is_owner?: boolean | null
  name?: string | null
  email?: string | null
}
