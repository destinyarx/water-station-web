import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DOCUMENT_APPROVE_ERROR,
  DOCUMENT_COLUMNS,
  DOCUMENT_DELETE_ERROR,
  DOCUMENT_SAVE_ERROR,
  DOCUMENTS_LOAD_ERROR,
  DOCUMENTS_TABLE,
} from '../documents.constants'
import { toDocument, toInsertRow, toUpdateRow } from '../documents.mapper'
import { documentRowSchema } from '../documents.schema'
import type { Document, DocumentFormValues, DocumentOwner } from '../documents.types'

const documentRowsSchema = z.array(documentRowSchema)

export async function getActiveDocuments(client: SupabaseClient): Promise<Document[]> {
  const { data, error } = await client
    .from(DOCUMENTS_TABLE)
    .select(DOCUMENT_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(DOCUMENTS_LOAD_ERROR)

  const rows = documentRowsSchema.parse(data ?? [])
  return rows.map(toDocument)
}

export async function createDocument(
  client: SupabaseClient,
  values: DocumentFormValues,
  owner: DocumentOwner,
): Promise<Document> {
  const { data, error } = await client
    .from(DOCUMENTS_TABLE)
    .insert(toInsertRow(values, owner))
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw new Error(DOCUMENT_SAVE_ERROR)

  return toDocument(documentRowSchema.parse(data))
}

export async function updateDocument(
  client: SupabaseClient,
  id: number,
  values: DocumentFormValues,
): Promise<Document> {
  const { data, error } = await client
    .from(DOCUMENTS_TABLE)
    .update(toUpdateRow(values))
    .eq('id', id)
    .is('deleted_at', null)
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw new Error(DOCUMENT_SAVE_ERROR)

  return toDocument(documentRowSchema.parse(data))
}

export async function softDeleteDocument(
  client: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client
    .from(DOCUMENTS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) throw new Error(DOCUMENT_DELETE_ERROR)
}

export async function setDocumentApproval(
  client: SupabaseClient,
  id: number,
  isApproved: boolean,
): Promise<Document> {
  const { data, error } = await client
    .from(DOCUMENTS_TABLE)
    .update({ is_approved: isApproved, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw new Error(DOCUMENT_APPROVE_ERROR)

  return toDocument(documentRowSchema.parse(data))
}
