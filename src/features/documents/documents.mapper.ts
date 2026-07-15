import type {
  Document,
  DocumentFormValues,
  DocumentInsert,
  DocumentOwner,
  DocumentRow,
  DocumentUpdate,
} from './documents.types'

function emptyToNull(value: string | undefined): string | null {
  const t = value?.trim()
  return t ? t : null
}

export function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    orgId: row.org_id,
    createdBy: row.created_by,
    uploaderName: row.uploader?.name ?? null,
    title: row.title,
    description: row.description,
    category: row.category,
    documentType: row.document_type,
    documentDate: row.document_date,
    amount: row.amount,
    expiryDate: row.expiry_date,
    visibility: row.visibility,
    isApproved: row.is_approved,
    originalName: row.original_name,
    filePath: row.file_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

export function toInsertRow(
  values: DocumentFormValues,
  owner: DocumentOwner,
  originalName: string,
): DocumentInsert {
  return {
    org_id: owner.orgId,
    created_by: owner.createdBy,
    title: values.title.trim(),
    description: emptyToNull(values.description),
    category: values.category,
    document_type: emptyToNull(values.documentType),
    document_date: emptyToNull(values.documentDate),
    amount: values.amount ?? null,
    expiry_date: emptyToNull(values.expiryDate),
    visibility: values.visibility,
    original_name: originalName,
  }
}

export function toUpdateRow(values: DocumentFormValues): DocumentUpdate {
  return {
    title: values.title.trim(),
    description: emptyToNull(values.description),
    category: values.category,
    document_type: emptyToNull(values.documentType),
    document_date: emptyToNull(values.documentDate),
    amount: values.amount ?? null,
    expiry_date: emptyToNull(values.expiryDate),
    visibility: values.visibility,
  }
}

export function toFormValues(doc: Document): DocumentFormValues {
  return {
    title: doc.title,
    description: doc.description ?? '',
    category: doc.category,
    documentType: doc.documentType ?? '',
    documentDate: doc.documentDate ?? '',
    amount: doc.amount ?? undefined,
    expiryDate: doc.expiryDate ?? '',
    visibility: doc.visibility,
  }
}
