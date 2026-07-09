import { ADD_STAFF_EDGE_URL, CREATE_ORG_EDGE_URL } from './registration.constants'
import type {
  RegistrationIdentity,
  RegistrationInput,
  RegistrationRequest,
} from './registration.types'

/**
 * Resolves the edge-function call for the chosen role.
 * - Owner → `create-aquaflow-organization`: sends the station name; the edge
 *   function generates the `organization_code` and creates the org/member/user.
 * - Staff → `aquaflow-add-staff`: sends the org code + contact number.
 *
 * `name`/`email` come from the Clerk session identity, never from form input.
 */
export function toEdgeRequest(
  input: RegistrationInput,
  identity: RegistrationIdentity,
): RegistrationRequest {
  const { name, email } = identity

  if (input.isOwner) {
    return {
      url: CREATE_ORG_EDGE_URL,
      body: {
        organization_name: input.organizationName,
        name,
        email,
      },
    }
  }

  return {
    url: ADD_STAFF_EDGE_URL,
    body: {
      organization_code: input.organizationCode,
      contact_number: input.contactNumber,
      name,
      email,
    },
  }
}
