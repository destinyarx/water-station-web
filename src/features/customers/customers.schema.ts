import { z } from 'zod'

/**
 * Shape of a `public.customers` row as returned by Supabase/PostgREST.
 * Used to validate read responses before they cross into the UI so a
 * malformed payload fails loudly instead of corrupting the display layer.
 *
 * Mirrors the Postgres schema in
 * `docs/specs/001-customers-basic-feature/REQUIREMENTS.md`.
 */
export const customerRowSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(100),
  is_business: z.boolean(),
  contact_number: z.string().max(15).nullable(),
  facebook_url: z.string().max(255).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  street_address: z.string().max(70).nullable(),
  barangay: z.string().max(70).nullable(),
  municipality: z.string().max(70).nullable(),
  province: z.string().max(70).nullable(),
  full_address: z.string().max(255).nullable(),
  is_active: z.boolean(),
  org_id: z.string().uuid(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

/** Whether a value is an `http`/`https` URL the UI accepts for `facebookUrl`. */
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Optional coordinate field driven by a text input. Blank strings become
 * `undefined`; numeric strings are coerced to numbers and range-checked.
 */
function optionalCoordinate(min: number, max: number, message: string) {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed === '') return undefined
      const parsed = Number(trimmed)
      return Number.isNaN(parsed) ? trimmed : parsed
    }
    return value
  }, z.number({ message }).min(min, message).max(max, message).optional())
}

/**
 * Validation for the create/edit customer form. The same schema backs the UI
 * form (React Hook Form) and the service-layer input so client and server
 * validation can never drift. Optional fields accept empty strings from inputs.
 */
export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Customer name is required.')
    .max(100, 'Name must be 100 characters or fewer.'),
  isBusiness: z.boolean(),
  contactNumber: z
    .string()
    .trim()
    .max(15, 'Contact number must be 15 characters or fewer.')
    .optional(),
  facebookUrl: z
    .string()
    .trim()
    .max(255, 'Link must be 255 characters or fewer.')
    .refine((value) => value === '' || isHttpUrl(value), 'Enter a valid URL.')
    .optional(),
  streetAddress: z.string().trim().max(70).optional(),
  barangay: z.string().trim().max(70).optional(),
  municipality: z.string().trim().max(70).optional(),
  province: z.string().trim().max(70).optional(),
  latitude: optionalCoordinate(-90, 90, 'Latitude must be between -90 and 90.'),
  longitude: optionalCoordinate(
    -180,
    180,
    'Longitude must be between -180 and 180.',
  ),
})
