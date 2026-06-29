import type { z } from 'zod'

import type { documentFormSchema, documentRowSchema } from './documents.schema'

export type DocumentRow = z.infer<typeof documentRowSchema>
export type DocumentFormValues = z.output<typeof documentFormSchema>
export type DocumentFormInput = z.input<typeof documentFormSchema>

export interface DocumentOwner {
  orgId: number
  createdBy: string
}

export interface DocumentInsert {
  org_id: number
  created_by: string
  title: string
  description: string | null
  category: string
  document_type: string | null
  document_date: string | null
  amount: number | null
  expiry_date: string | null
  visibility: 'all' | 'only_me'
}

export interface DocumentUpdate {
  title: string
  description: string | null
  category: string
  document_type: string | null
  document_date: string | null
  amount: number | null
  expiry_date: string | null
  visibility: 'all' | 'only_me'
  updated_at: string
}

export interface Document {
  id: number
  orgId: number
  createdBy: string
  uploaderName: string | null
  title: string
  description: string | null
  category: string
  documentType: string | null
  documentDate: string | null
  amount: number | null
  expiryDate: string | null
  visibility: 'all' | 'only_me'
  isApproved: boolean
  originalName: string | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
