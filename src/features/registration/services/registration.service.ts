import axios from 'axios'
import { toEdgeRequest } from '../registration.mapper'
import type {
  RegistrationIdentity,
  RegistrationInput,
} from '../registration.types'

/**
 * Submits onboarding to the role-appropriate Supabase edge function,
 * authenticated with the caller's Clerk session token. The function creates the
 * org/membership records and writes the user's `public_metadata`
 * (`organization` uuid + `is_owner`).
 */
export async function submitRegistration(
  input: RegistrationInput,
  token: string,
  identity: RegistrationIdentity,
): Promise<void> {
  const { url, body } = toEdgeRequest(input, identity)

  if (!url) {
    throw new Error(
      'Missing onboarding edge-function URL. Check NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL and NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL.',
    )
  }

  await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}
