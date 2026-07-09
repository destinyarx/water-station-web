export const REGISTRATION_REDIRECT_PATH = '/complete-registration'
export const POST_REGISTRATION_PATH = '/dashboard'

/**
 * Onboarding edge functions. Owners create a station; staff join one by code.
 * Both write the caller's Clerk `public_metadata` (`organization` uuid + `is_owner`).
 */
export const CREATE_ORG_EDGE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL ?? ''

export const ADD_STAFF_EDGE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL ?? ''
