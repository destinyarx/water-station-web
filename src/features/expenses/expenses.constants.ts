/** Supabase table backing the expenses feature. */
export const EXPENSES_TABLE = 'expenses'

/** Columns selected for expense reads, matching `expenseRowSchema`. */
export const EXPENSE_COLUMNS =
  'id, name, amount, category, category_other, payment_method, payment_method_other, description, date_incurred, references_number, org_id, created_by, created_at, updated_at, deleted_at'

/** User-facing message shown when the expense list fails to load. */
export const EXPENSES_LOAD_ERROR =
  'Unable to load expenses. Please try again.'

/** User-facing message shown when saving an expense fails. */
export const EXPENSE_SAVE_ERROR = 'Unable to save expense. Please try again.'

/** User-facing message shown when deleting an expense fails. */
export const EXPENSE_DELETE_ERROR =
  'Unable to delete expense. Please try again.'

export const expenseCategoryValues = [
  'utilities',
  'water_production_supplies',
  'containers_packaging',
  'machine_maintenance_repairs',
  'delivery_expenses',
  'inventory_products_purchased',
  'rent_facility',
  'salaries_labor',
  'permits_government_fees',
  'testing_compliance',
  'marketing_promotion',
  'office_admin_supplies',
  'software_subscriptions',
  'bank_payment_fees',
  'cleaning_sanitation',
  'equipment_purchase',
  'miscellaneous',
  'other',
] as const

export const paymentMethodValues = [
  'cash',
  'gcash',
  'maya',
  'qr_ph',
  'bank_transfer',
  'debit_card',
  'credit_card',
  'cash_on_delivery',
  'other',
] as const

export const expenseCategories = [
  { name: 'Utilities', value: 'utilities' },
  { name: 'Water Production Supplies', value: 'water_production_supplies' },
  { name: 'Containers & Packaging', value: 'containers_packaging' },
  {
    name: 'Machine Maintenance & Repairs',
    value: 'machine_maintenance_repairs',
  },
  { name: 'Delivery Expenses', value: 'delivery_expenses' },
  {
    name: 'Inventory / Products Purchased',
    value: 'inventory_products_purchased',
  },
  { name: 'Rent & Facility', value: 'rent_facility' },
  { name: 'Salaries & Labor', value: 'salaries_labor' },
  { name: 'Permits & Government Fees', value: 'permits_government_fees' },
  { name: 'Testing & Compliance', value: 'testing_compliance' },
  { name: 'Marketing & Promotion', value: 'marketing_promotion' },
  { name: 'Office & Admin Supplies', value: 'office_admin_supplies' },
  { name: 'Software & Subscriptions', value: 'software_subscriptions' },
  { name: 'Bank & Payment Fees', value: 'bank_payment_fees' },
  { name: 'Cleaning & Sanitation', value: 'cleaning_sanitation' },
  { name: 'Equipment Purchase', value: 'equipment_purchase' },
  { name: 'Miscellaneous', value: 'miscellaneous' },
  { name: 'Other', value: 'other' },
] as const

export const paymentMethods = [
  { name: 'Cash', value: 'cash' },
  { name: 'GCash', value: 'gcash' },
  { name: 'Maya', value: 'maya' },
  { name: 'QR Ph', value: 'qr_ph' },
  { name: 'Bank Transfer', value: 'bank_transfer' },
  { name: 'Debit Card', value: 'debit_card' },
  { name: 'Credit Card', value: 'credit_card' },
  { name: 'Cash on Delivery', value: 'cash_on_delivery' },
  { name: 'Other', value: 'other' },
] as const

/** Empty default values for the create/edit expense form. */
export const EXPENSE_FORM_DEFAULTS = {
  name: '',
  amount: undefined,
  category: 'utilities',
  categoryOther: '',
  paymentMethod: 'cash',
  paymentMethodOther: '',
  description: '',
  dateIncurred: new Date().toISOString().slice(0, 10),
  referencesNumber: '',
} as const
