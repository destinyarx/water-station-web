import axios from 'axios'
import { toEdgePayload } from '../registration.mapper'
import { REGISTRATION_EDGE_URL } from '../registration.constants'
import type { RegistrationInput } from '../registration.types'

/**
 * Submits onboarding data to the Supabase edge function, authenticated with the
 * caller's Clerk session token. The function updates the user's session-token
 * claims (`is_owner`, `organization`).
 */
export async function submitRegistration(
  input: RegistrationInput,
  token: string,
): Promise<void> {
  if (!REGISTRATION_EDGE_URL) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL environment variable.',
    )
  }

  await axios.post(REGISTRATION_EDGE_URL, toEdgePayload(input), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}
