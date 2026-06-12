/** Supabase table backing the customers feature. */
export const CUSTOMERS_TABLE = 'customers'

/** Columns selected for the customer read path, matching `customerRowSchema`. */
export const CUSTOMER_COLUMNS =
  'id, name, is_business, contact_number, facebook_url, latitude, longitude, street_address, barangay, municipality, province, full_address, org_id, created_by, created_at, updated_at, deleted_at'

/** User-facing message shown when the customer list fails to load. */
export const CUSTOMERS_LOAD_ERROR = 'Unable to load customers. Please try again.'
