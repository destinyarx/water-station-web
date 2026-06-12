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
  org_id: z.number().int(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})
