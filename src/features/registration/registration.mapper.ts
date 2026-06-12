import type { RegistrationInput, RegistrationPayload } from './registration.types'

/**
 * Maps validated form input to the edge-function payload.
 * - Owner: `organization` is null (server fills it); no gender/phone.
 * - Staff: `organization` is the invite code; gender + phone are included.
 */
export function toEdgePayload(input: RegistrationInput): RegistrationPayload {
  if (input.isOwner) {
    return {
      is_owner: true,
      organization: null,
    }
  }

  return {
    is_owner: false,
    organization: input.inviteCode,
    gender: input.gender,
    phone_number: input.phoneNumber,
  }
}
