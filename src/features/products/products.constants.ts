/** Supabase table backing the products feature. */
export const PRODUCTS_TABLE = 'products'

/** Columns selected from `public.products` for active list and mutations. */
export const PRODUCT_COLUMNS =
  'id, product_name, price, is_stock_tracked, stock, descriptions, is_active, org_id, created_by, created_at, updated_at, deleted_at'

/** Stock at or below this (and above 0) is surfaced as "low stock" in the UI. */
export const LOW_STOCK_THRESHOLD = 10

export const PRODUCTS_LOAD_ERROR = 'Unable to load products. Please try again.'
export const PRODUCT_SAVE_ERROR = 'Unable to save product. Please try again.'
export const PRODUCT_DELETE_ERROR = 'Unable to delete product. Please try again.'

/**
 * Clerk JWT template whose claims (`organization`, `sub`, `is_owner`) back the
 * Supabase product RLS policies. Must match the template configured in Clerk.
 */
export const CLERK_SUPABASE_TEMPLATE = 'water-station'

export const PRODUCT_FORM_DEFAULTS = {
  productName: '',
  price: undefined,
  isStockTracked: true,
  stock: undefined,
  description: '',
}

export const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})
