import type { Customer, CustomerRow } from './customers.types'

/**
 * Builds the denormalized display address from the address parts, skipping
 * empty segments. Returns null when no parts are available.
 */
function assembleFullAddress(row: CustomerRow): string | null {
  const parts = [
    row.street_address,
    row.barangay,
    row.municipality,
    row.province,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  return parts.length > 0 ? parts.join(', ') : null
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
    fullAddress: storedFullAddress ? storedFullAddress : assembleFullAddress(row),
    orgId: row.org_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}
