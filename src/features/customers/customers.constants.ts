/** Supabase table backing the customers feature. */
export const CUSTOMERS_TABLE = 'customers'

/** Columns selected for the customer read path, matching `customerRowSchema`. */
export const CUSTOMER_COLUMNS =
  'id, name, is_business, contact_number, facebook_url, latitude, longitude, street_address, barangay, municipality, province, full_address, is_active, org_id, created_by, created_at, updated_at, deleted_at'

/** User-facing message shown when the customer list fails to load. */
export const CUSTOMERS_LOAD_ERROR = 'Unable to load customers. Please try again.'

/** User-facing message shown when saving a customer fails. */
export const CUSTOMER_SAVE_ERROR = 'Unable to save customer. Please try again.'

/** User-facing message shown when archiving a customer fails. */
export const CUSTOMER_ARCHIVE_ERROR =
  'Unable to archive customer. Please try again.'

/** User-facing message shown when toggling a customer's status fails. */
export const CUSTOMER_STATUS_ERROR =
  'Unable to update customer status. Please try again.'

/** A write that matched no rows: RLS refused it, or the row was archived. */
export const CUSTOMER_NOT_PERMITTED_ERROR =
  'Nothing was changed. This customer may have been archived, or you may not have permission to change it.'

/** Empty default values for the create/edit customer form. */
export const CUSTOMER_FORM_DEFAULTS = {
  name: '',
  isBusiness: false,
  contactNumber: '',
  facebookUrl: '',
  streetAddress: '',
  barangay: '',
  municipality: '',
  province: '',
  latitude: undefined,
  longitude: undefined,
} as const
