import type { z } from 'zod'
import type { customerFormSchema, customerRowSchema } from './customers.schema'

/** A raw `public.customers` row as validated from Supabase. */
export type CustomerRow = z.infer<typeof customerRowSchema>

/** Raw field values the customer form holds before Zod transforms them. */
export type CustomerFormInput = z.input<typeof customerFormSchema>

/** Validated values produced by the create/edit customer form. */
export type CustomerFormValues = z.output<typeof customerFormSchema>

/**
 * Ownership context resolved from the Clerk identity, applied server-side by
 * the service layer. Never sourced from form input so a client cannot spoof
 * the tenant or creator (RLS also enforces this).
 */
export interface CustomerOwner {
  orgId: string
  createdBy: string
}

/** Snake_case payload inserted into `public.customers`. */
export interface CustomerInsert {
  name: string
  is_business: boolean
  contact_number: string | null
  facebook_url: string | null
  latitude: number | null
  longitude: number | null
  street_address: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  full_address: string | null
  org_id: string
  created_by: string
}

/** Snake_case payload sent in a customer update. */
export interface CustomerUpdate {
  name: string
  is_business: boolean
  contact_number: string | null
  facebook_url: string | null
  latitude: number | null
  longitude: number | null
  street_address: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  full_address: string | null
  updated_at: string
}

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
  isActive: boolean
  orgId: string
  createdBy: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
