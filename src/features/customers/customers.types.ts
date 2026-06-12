import type { z } from 'zod'
import type { customerRowSchema } from './customers.schema'

/** A raw `public.customers` row as validated from Supabase. */
export type CustomerRow = z.infer<typeof customerRowSchema>

/**
 * Display model consumed by the UI. Snake_case database columns are mapped to
 * camelCase, and `fullAddress` is a denormalized value assembled from the
 * address parts when the stored value is absent.
 */
export interface Customer {
  id: number
  name: string
  isBusiness: boolean
  contactNumber: string | null
  facebookUrl: string | null
  latitude: number | null
  longitude: number | null
  streetAddress: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  fullAddress: string | null
  orgId: number
  createdBy: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
