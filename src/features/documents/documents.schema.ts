import { z } from 'zod'

import { documentCategoryValues } from './documents.constants'

export const documentCategorySchema = z.enum(documentCategoryValues)

export const documentRowSchema = z.object({
  id: z.number(),
  org_id: z.string().uuid(),
  created_by: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: documentCategorySchema,
  document_type: z.string().nullable(),
  document_date: z.string().nullable(),
  amount: z.number().nullable(),
  expiry_date: z.string().nullable(),
  visibility: z.enum(['all', 'only_me']),
  is_approved: z.boolean(),
  original_name: z.string().nullable(),
  file_path: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
  uploader: z.object({ name: z.string() }).nullable(),
})

export const documentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(200, 'Title must be 200 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or fewer.')
    .optional(),
  category: documentCategorySchema,
  documentType: z.string().trim().max(100).optional(),
  documentDate: z.string().optional(),
  amount: z.preprocess(
    (v) => {
      if (typeof v === 'string') {
        const t = v.trim()
        if (t === '') return undefined
        const n = Number(t)
        return Number.isNaN(n) ? t : n
      }
      return v
    },
    z
      .number({ message: 'Amount must be a valid number.' })
      .positive('Amount must be greater than 0.')
      .optional(),
  ),
  expiryDate: z.string().optional(),
  visibility: z.enum(['all', 'only_me']),
})
