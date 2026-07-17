import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DOCUMENT_APPROVE_ERROR,
  DOCUMENT_ACCEPTED_MIME_TYPES,
  DOCUMENT_MAX_FILE_SIZE,
  DOCUMENT_OPEN_ERROR,
  DOCUMENTS_BUCKET,
  DOCUMENT_COLUMNS,
  DOCUMENT_DELETE_ERROR,
  DOCUMENT_SAVE_ERROR,
  DOCUMENTS_LOAD_ERROR,
  DOCUMENTS_TABLE,
} from '../documents.constants'
import { toDocument, toInsertRow, toUpdateRow } from '../documents.mapper'
import { documentRowSchema } from '../documents.schema'
import type { Document, DocumentFormValues, DocumentOwner } from '../documents.types'
import type { CreateDocumentInput, DocumentPage, DocumentStats } from '../documents.types'
import type { DocumentFilters } from '../documents.keys'

const documentRowsSchema = z.array(documentRowSchema)

export async function getActiveDocuments(client: SupabaseClient, filters: DocumentFilters): Promise<DocumentPage> {
  let query = client
    .from(DOCUMENTS_TABLE)
    .select(DOCUMENT_COLUMNS, { count: 'exact' })
    .is('deleted_at', null)

  const search = filters.search.trim()
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,document_type.ilike.%${search}%`)
  if (filters.category !== 'all') query = query.eq('category', filters.category)
  if (filters.visibility === 'mine') query = query.eq('created_by', filters.currentUserId)

  const from = (filters.page - 1) * filters.perPage
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + filters.perPage - 1)

  if (error) throw new Error(DOCUMENTS_LOAD_ERROR)

  const rows = documentRowsSchema.parse(data ?? [])
  return { documents: rows.map(toDocument), total: count ?? 0 }
}

export async function getDocumentStats(client: SupabaseClient): Promise<DocumentStats> {
  const today = new Date().toISOString().slice(0, 10)
  const inThirtyDays = new Date()
  inThirtyDays.setDate(inThirtyDays.getDate() + 30)
  const through = inThirtyDays.toISOString().slice(0, 10)
  const results = await Promise.all([
    client.from(DOCUMENTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null),
    client.from(DOCUMENTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('visibility', 'only_me'),
    client.from(DOCUMENTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('visibility', 'all'),
    client.from(DOCUMENTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).gte('expiry_date', today).lte('expiry_date', through),
  ])
  if (results.some(({ error }) => error)) throw new Error(DOCUMENTS_LOAD_ERROR)
  const [total, privateCount, sharedCount, expiringSoon] = results.map(({ count }) => count ?? 0)
  return { total, privateCount, sharedCount, expiringSoon }
}

function validateDocumentFile(file: File): void {
  if (!DOCUMENT_ACCEPTED_MIME_TYPES.some((type) => type === file.type)) {
    throw new Error('Choose a PDF, PNG, JPG, or WEBP file.')
  }
  if (file.size > DOCUMENT_MAX_FILE_SIZE) throw new Error('Document files must be 10 MB or smaller.')
}

function safeFileName(name: string): string {
  const normalized = name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return normalized || 'document'
}

export async function createDocument(
  client: SupabaseClient,
  input: CreateDocumentInput,
  owner: DocumentOwner,
): Promise<Document> {
  validateDocumentFile(input.file)
  const { data: createdData, error: createError } = await client
    .from(DOCUMENTS_TABLE)
    .insert(toInsertRow(input.values, owner, input.file.name))
    .select(DOCUMENT_COLUMNS)
    .single()

  if (createError) throw new Error(DOCUMENT_SAVE_ERROR)
  const created = toDocument(documentRowSchema.parse(createdData))
  const path = `${owner.orgId}/${created.id}/${crypto.randomUUID()}-${safeFileName(input.file.name)}`
  const { data: pathRows, error: pathError } = await client.from(DOCUMENTS_TABLE).update({ file_path: path }).eq('id', created.id).select('id')
  if (pathError || !pathRows?.length) {
    await client.from(DOCUMENTS_TABLE).update({ deleted_at: new Date().toISOString() }).eq('id', created.id)
    throw new Error(DOCUMENT_SAVE_ERROR)
  }
  const { error: uploadError } = await client.storage.from(DOCUMENTS_BUCKET).upload(path, input.file, { contentType: input.file.type, upsert: false })
  if (uploadError) {
    await client.from(DOCUMENTS_TABLE).update({ deleted_at: new Date().toISOString() }).eq('id', created.id)
    throw new Error(DOCUMENT_SAVE_ERROR)
  }

  const { data, error } = await client
    .from(DOCUMENTS_TABLE)
    .select(DOCUMENT_COLUMNS)
    .eq('id', created.id)
    .single()

  if (error) {
    await client.storage.from(DOCUMENTS_BUCKET).remove([path])
    await client.from(DOCUMENTS_TABLE).update({ deleted_at: new Date().toISOString() }).eq('id', created.id)
    throw new Error(DOCUMENT_SAVE_ERROR)
  }

  return toDocument(documentRowSchema.parse(data))
}

export async function createDocumentSignedUrl(client: SupabaseClient, doc: Document): Promise<string> {
  if (!doc.filePath) throw new Error(DOCUMENT_OPEN_ERROR)
  const { data, error } = await client.storage.from(DOCUMENTS_BUCKET).createSignedUrl(doc.filePath, 60)
  if (error) throw new Error(DOCUMENT_OPEN_ERROR)
  return data.signedUrl
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

export async function deleteDocument(
  client: SupabaseClient,
  doc: Document,
): Promise<void> {
  // Prove row-level update permission before deleting the irreversible object.
  // Keep file_path linked during Storage DELETE because its policy authorizes
  // through the matching documents row.
  const { data: permittedRows, error: permissionError } = await client
    .from(DOCUMENTS_TABLE)
    .update({ file_path: doc.filePath })
    .eq('id', doc.id)
    .is('deleted_at', null)
    .select('id')

  if (permissionError || !permittedRows?.length) throw new Error(DOCUMENT_DELETE_ERROR)

  if (doc.filePath) {
    const { error: storageError } = await client.storage
      .from(DOCUMENTS_BUCKET)
      .remove([doc.filePath])

    if (storageError) throw new Error(DOCUMENT_DELETE_ERROR)
  }

  const { data: deletedRows, error: deleteError } = await client
    .from(DOCUMENTS_TABLE)
    .update({ file_path: null, deleted_at: new Date().toISOString() })
    .eq('id', doc.id)
    .is('deleted_at', null)
    .select('id')

  if (deleteError || !deletedRows?.length) {
    // The object is already gone; best-effort unlink prevents a live record
    // from retaining a broken Storage connection if a concurrent write won.
    await client.from(DOCUMENTS_TABLE).update({ file_path: null }).eq('id', doc.id)
    throw new Error(DOCUMENT_DELETE_ERROR)
  }
}

export async function setDocumentApproval(
  client: SupabaseClient,
  id: number,
  isApproved: boolean,
): Promise<Document> {
  const { data, error } = await client
    .from(DOCUMENTS_TABLE)
    .update({ is_approved: isApproved })
    .eq('id', id)
    .is('deleted_at', null)
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw new Error(DOCUMENT_APPROVE_ERROR)

  return toDocument(documentRowSchema.parse(data))
}
