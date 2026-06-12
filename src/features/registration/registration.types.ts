import type { z } from 'zod'
import type { registrationSchema } from './registration.schema'
import type { GENDERS } from './registration.constants'

export type Gender = (typeof GENDERS)[number]

export type RegistrationInput = z.infer<typeof registrationSchema>

/**
 * Payload sent to the Supabase `update-clerk-session-tokens` edge function.
 * For owners, `organization` is null — the edge function creates the station
 * and assigns the non-null `organization` session claim server-side.
 */
export interface RegistrationPayload {
  is_owner: boolean
  organization: string | null
  gender?: Gender
  phone_number?: string
}

/**
 * Shape of the Clerk session-token custom claims this app relies on.
 * Populated by the edge function after onboarding.
 */
export interface RegistrationSessionClaims {
  organization?: string | null
  is_owner?: boolean | null
}
