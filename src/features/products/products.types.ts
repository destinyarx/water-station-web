import type { z } from 'zod'

import type { productFormSchema, productRowSchema } from './products.schema'

/** A raw `public.products` row as validated from Supabase. */
export type ProductRow = z.infer<typeof productRowSchema>

/** Raw field values the product form holds before Zod transforms them. */
export type ProductFormInput = z.input<typeof productFormSchema>

/** Validated values produced by the create/edit product form. */
export type ProductFormValues = z.output<typeof productFormSchema>

/** Tenant and creator resolved from Clerk session claims. */
export interface ProductOwner {
  orgId: string
  createdBy: string
}

/** Snake_case payload inserted into `public.products`. */
export interface ProductInsert {
  product_name: string
  price: number
  is_stock_tracked: boolean
  stock: number
  descriptions: string | null
  org_id: string
  created_by: string
}

/** Snake_case payload sent in a product update. */
export interface ProductUpdate {
  product_name: string
  price: number
  is_stock_tracked: boolean
  stock: number
  descriptions: string | null
}

export interface ProductPage {
  products: Product[]
  total: number
}

export interface ProductStats {
  total: number
  active: number
  stockTracked: number
  low: number
  out: number
}

/** Display model consumed by the Products UI. */
export interface Product {
  id: number
  productName: string
  price: number
  isStockTracked: boolean
  stock: number
  description: string | null
  isActive: boolean
  orgId: string
  createdBy: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
