import type { z } from 'zod'

import type { documentFormSchema, documentRowSchema } from './documents.schema'
import type { DocumentCategory } from './documents.constants'

export type DocumentRow = z.infer<typeof documentRowSchema>
export type DocumentFormValues = z.output<typeof documentFormSchema>
export type DocumentFormInput = z.input<typeof documentFormSchema>

export interface DocumentOwner {
  orgId: string
  createdBy: string
}

export interface DocumentInsert {
  org_id: string
  created_by: string
  title: string
  description: string | null
  category: DocumentCategory
  document_type: string | null
  document_date: string | null
  amount: number | null
  expiry_date: string | null
  visibility: 'all' | 'only_me'
  original_name: string
}

export interface DocumentUpdate {
  title: string
  description: string | null
  category: DocumentCategory
  document_type: string | null
  document_date: string | null
  amount: number | null
  expiry_date: string | null
  visibility: 'all' | 'only_me'
}

export interface CreateDocumentInput {
  values: DocumentFormValues
  file: File
}

export interface DocumentPage {
  documents: Document[]
  total: number
}

export interface DocumentStats {
  total: number
  privateCount: number
  sharedCount: number
  expiringSoon: number
}

export interface Document {
  id: number
  orgId: string
  createdBy: string
  uploaderName: string | null
  title: string
  description: string | null
  category: DocumentCategory
  documentType: string | null
  documentDate: string | null
  amount: number | null
  expiryDate: string | null
  visibility: 'all' | 'only_me'
  isApproved: boolean
  originalName: string | null
  filePath: string | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
