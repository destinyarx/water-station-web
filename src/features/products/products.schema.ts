import { z } from 'zod'

/** Shape of a `public.products` row as returned by Supabase/PostgREST. */
export const productRowSchema = z.object({
  id: z.number().int(),
  product_name: z.string().min(1).max(255),
  price: z.number().min(0),
  is_stock_tracked: z.boolean(),
  stock: z.number().int().min(0),
  descriptions: z.string().max(255).nullable(),
  is_active: z.boolean(),
  org_id: z.number().int(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

function optionalNumber(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? value : parsed
  }

  return value
}

/**
 * Validation for the create/edit product form. It normalizes non-stock-tracked
 * products to `stock = 0` so services and fees have predictable stored values.
 */
export const productFormSchema = z
  .object({
    productName: z
      .string()
      .trim()
      .min(1, 'Product name is required.')
      .max(255, 'Product name must be 255 characters or fewer.'),
    price: z.preprocess(
      optionalNumber,
      z.number({ message: 'Price is required.' }).min(0, 'Price must be 0 or greater.'),
    ),
    isStockTracked: z.boolean(),
    stock: z.preprocess(optionalNumber, z.number().int().min(0).optional()),
    description: z
      .string()
      .trim()
      .max(255, 'Description must be 255 characters or fewer.')
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.isStockTracked && values.stock == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['stock'],
        message: 'Stock is required when stock tracking is enabled.',
      })
    }
  })
  .transform((values) => ({
    ...values,
    stock: values.isStockTracked ? values.stock ?? 0 : 0,
    description: values.description ?? '',
  }))
