import type {
  Customer,
  CustomerFormValues,
  CustomerInsert,
  CustomerOwner,
  CustomerRow,
  CustomerUpdate,
} from './customers.types'

/**
 * Builds the denormalized display address from address parts, skipping empty
 * segments. Returns null when no parts are available.
 */
function assembleFullAddress(
  parts: Array<string | null | undefined>,
): string | null {
  const present = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  return present.length > 0 ? present.join(', ') : null
}

/** Normalizes an optional form string to a trimmed value or null. */
function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * Maps a validated database row to the camelCase display model. Prefers a
 * stored `full_address`; otherwise assembles one from the address parts.
 */
export function toCustomer(row: CustomerRow): Customer {
  const storedFullAddress = row.full_address?.trim()

  return {
    id: row.id,
    name: row.name,
    isBusiness: row.is_business,
    contactNumber: row.contact_number,
    facebookUrl: row.facebook_url,
    latitude: row.latitude,
    longitude: row.longitude,
    streetAddress: row.street_address,
    barangay: row.barangay,
    municipality: row.municipality,
    province: row.province,
    fullAddress: storedFullAddress
      ? storedFullAddress
      : assembleFullAddress([
          row.street_address,
          row.barangay,
          row.municipality,
          row.province,
        ]),
    isActive: row.is_active,
    orgId: row.org_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

/**
 * Maps validated form values to a snake_case insert payload. Tenant and creator
 * come from the resolved Clerk identity (`owner`), never from form input, so a
 * client cannot insert rows for another tenant. `full_address` is assembled
 * from the address parts for queryable, denormalized display.
 */
export function toInsertRow(
  values: CustomerFormValues,
  owner: CustomerOwner,
): CustomerInsert {
  return {
    name: values.name.trim(),
    is_business: values.isBusiness,
    contact_number: emptyToNull(values.contactNumber),
    facebook_url: emptyToNull(values.facebookUrl),
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    street_address: emptyToNull(values.streetAddress),
    barangay: emptyToNull(values.barangay),
    municipality: emptyToNull(values.municipality),
    province: emptyToNull(values.province),
    full_address: assembleFullAddress([
      values.streetAddress,
      values.barangay,
      values.municipality,
      values.province,
    ]),
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

/**
 * Maps a display model back to editable form values, seeding the edit form.
 * Nullable columns become empty strings (text inputs) or `undefined`
 * (coordinates), matching the form's value shape.
 */
export function toFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    isBusiness: customer.isBusiness,
    contactNumber: customer.contactNumber ?? '',
    facebookUrl: customer.facebookUrl ?? '',
    streetAddress: customer.streetAddress ?? '',
    barangay: customer.barangay ?? '',
    municipality: customer.municipality ?? '',
    province: customer.province ?? '',
    latitude: customer.latitude ?? undefined,
    longitude: customer.longitude ?? undefined,
  }
}

/**
 * Maps validated form values to a snake_case update payload. Ownership columns
 * (`org_id`, `created_by`) are intentionally omitted — they are immutable and
 * enforced by RLS — while `updated_at` is stamped to the current time.
 */
export function toUpdateRow(values: CustomerFormValues): CustomerUpdate {
  return {
    name: values.name.trim(),
    is_business: values.isBusiness,
    contact_number: emptyToNull(values.contactNumber),
    facebook_url: emptyToNull(values.facebookUrl),
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    street_address: emptyToNull(values.streetAddress),
    barangay: emptyToNull(values.barangay),
    municipality: emptyToNull(values.municipality),
    province: emptyToNull(values.province),
    full_address: assembleFullAddress([
      values.streetAddress,
      values.barangay,
      values.municipality,
      values.province,
    ]),
    updated_at: new Date().toISOString(),
  }
}
