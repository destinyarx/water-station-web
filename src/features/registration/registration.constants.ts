export const GENDERS = ['male', 'female', 'other'] as const

export const GENDER_LABELS: Record<(typeof GENDERS)[number], string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

export const REGISTRATION_REDIRECT_PATH = '/complete-registration'
export const POST_REGISTRATION_PATH = '/dashboard'

export const REGISTRATION_EDGE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL ?? ''
