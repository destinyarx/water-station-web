import type { ExpenseCategory, PaymentMethod } from './expenses.types'

/** Badge colors for an expense category chip, keyed by the real DB value. */
export interface CategoryMeta {
  bg: string
  text: string
  dot: string
}

/** Icon-chip colors + short initial for a payment method, keyed by the real DB value. */
export interface PaymentMeta {
  bg: string
  color: string
  initial: string
}

const GRAY: CategoryMeta = {
  bg: 'var(--app-chip-gray-bg)',
  text: 'var(--app-chip-gray-text)',
  dot: '#94a3b8',
}

const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  utilities: { bg: 'var(--app-chip-bg)', text: 'var(--app-brand)', dot: '#0ea5e9' },
  water_production_supplies: { bg: 'rgba(6,182,212,0.14)', text: '#0e7490', dot: '#06b6d4' },
  containers_packaging: { bg: 'rgba(20,184,166,0.14)', text: '#0f766e', dot: '#14b8a6' },
  machine_maintenance_repairs: { bg: 'rgba(139,92,246,0.14)', text: '#7c3aed', dot: '#8b5cf6' },
  delivery_expenses: { bg: 'rgba(249,115,22,0.14)', text: '#c2410c', dot: '#f97316' },
  inventory_products_purchased: { bg: 'var(--app-chip-amber-bg)', text: 'var(--app-chip-amber-text)', dot: '#f59e0b' },
  rent_facility: { bg: 'rgba(100,116,139,0.14)', text: '#475569', dot: '#64748b' },
  salaries_labor: { bg: 'var(--app-chip-green-bg)', text: 'var(--app-chip-green-text)', dot: '#22c55e' },
  permits_government_fees: { bg: 'var(--app-chip-red-bg)', text: 'var(--app-chip-red-text)', dot: '#ef4444' },
  testing_compliance: { bg: 'rgba(6,182,212,0.14)', text: '#0e7490', dot: '#06b6d4' },
  marketing_promotion: { bg: 'rgba(236,72,153,0.14)', text: '#be185d', dot: '#ec4899' },
  office_admin_supplies: { bg: 'var(--app-chip-bg)', text: 'var(--app-brand)', dot: '#0ea5e9' },
  software_subscriptions: { bg: 'rgba(99,102,241,0.14)', text: '#4f46e5', dot: '#6366f1' },
  bank_payment_fees: { bg: 'var(--app-chip-green-bg)', text: 'var(--app-chip-green-text)', dot: '#22c55e' },
  cleaning_sanitation: { bg: 'rgba(14,165,233,0.14)', text: '#0369a1', dot: '#0ea5e9' },
  equipment_purchase: { bg: 'rgba(139,92,246,0.14)', text: '#7c3aed', dot: '#8b5cf6' },
  miscellaneous: GRAY,
  other: GRAY,
}

const PAYMENT_META: Record<PaymentMethod, PaymentMeta> = {
  cash: { bg: 'rgba(34,197,94,0.16)', color: '#15803d', initial: '₱' },
  gcash: { bg: 'rgba(0,122,255,0.16)', color: '#0a6cc4', initial: 'G' },
  maya: { bg: 'rgba(16,185,129,0.16)', color: '#0f766e', initial: 'M' },
  qr_ph: { bg: 'rgba(99,102,241,0.16)', color: '#4f46e5', initial: 'Q' },
  bank_transfer: { bg: 'rgba(99,102,241,0.16)', color: '#4f46e5', initial: 'B' },
  debit_card: { bg: 'rgba(139,92,246,0.16)', color: '#7c3aed', initial: 'D' },
  credit_card: { bg: 'rgba(139,92,246,0.16)', color: '#7c3aed', initial: 'C' },
  cash_on_delivery: { bg: 'rgba(34,197,94,0.16)', color: '#15803d', initial: '₱' },
  other: { bg: 'var(--app-chip-gray-bg)', color: 'var(--app-chip-gray-text)', initial: '•' },
}

export function getCategoryMeta(category: ExpenseCategory): CategoryMeta {
  return CATEGORY_META[category] ?? GRAY
}

export function getPaymentMeta(method: PaymentMethod): PaymentMeta {
  return PAYMENT_META[method] ?? PAYMENT_META.other
}
