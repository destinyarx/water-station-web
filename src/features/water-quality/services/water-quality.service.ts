import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DOCUMENTS_BUCKET,
  DOCUMENTS_TABLE,
  WATER_QUALITY_COLUMNS,
  WATER_QUALITY_DELETE_ERROR,
  WATER_QUALITY_DOCUMENT_CATEGORY,
  WATER_QUALITY_LOAD_ERROR,
  WATER_QUALITY_SAVE_ERROR,
  WATER_QUALITY_TABLE,
} from '../water-quality.constants'
import {
  buildDocumentDescription,
  buildDocumentTitle,
  computePassRate,
  monthStartISO,
  toInsertRow,
  toUpdateRow,
  toWaterQualityTest,
} from '../water-quality.mapper'
import {
  validateAttachments,
  waterQualityRowSchema,
} from '../water-quality.schema'
import type {
  WaterQualityFormValues,
  WaterQualityOwner,
  WaterQualityPage,
  WaterQualityStats,
  WaterQualityTest,
  WaterQualityWriteInput,
} from '../water-quality.types'
import type { WaterQualityFilters } from '../water-quality.keys'

const waterQualityRowsSchema = z.array(waterQualityRowSchema)

/**
 * Loads active (non-deleted) water quality tests visible to the caller, newest
 * test first. Tenant isolation is enforced by RLS; the `deleted_at is null`
 * filter only hides soft-deleted rows. Raw database errors are never surfaced.
 */
export async function getActiveTests(
  client: SupabaseClient,
  filters: WaterQualityFilters,
): Promise<WaterQualityPage> {
  const page = Math.max(1, filters.page)
  const perPage = Math.max(1, filters.perPage)
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = client
    .from(WATER_QUALITY_TABLE)
    .select(WATER_QUALITY_COLUMNS, { count: 'exact' })
    .is('deleted_at', null)

  const search = filters.search.trim()
  if (search !== '') {
    const term = search.replace(/[%,]/g, ' ')
    query = query.or(
      `remarks.ilike.%${term}%,lab_name.ilike.%${term}%,tested_by.ilike.%${term}%,report_no.ilike.%${term}%,water_source.ilike.%${term}%`,
    )
  }

  if (filters.method !== 'all') {
    query = query.eq('method', filters.method)
  }

  if (filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error, count } = await query
    .order('test_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(WATER_QUALITY_LOAD_ERROR)
  }

  const rows = waterQualityRowsSchema.parse(data ?? [])
  return { tests: rows.map(toWaterQualityTest), total: count ?? 0 }
}

/** Loads a single test by id, scoped to the caller's tenant by RLS. */
export async function getTestById(
  client: SupabaseClient,
  id: number,
): Promise<WaterQualityTest | null> {
  const { data, error } = await client
    .from(WATER_QUALITY_TABLE)
    .select(WATER_QUALITY_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    throw new Error(WATER_QUALITY_LOAD_ERROR)
  }

  if (!data) {
    return null
  }

  return toWaterQualityTest(waterQualityRowSchema.parse(data))
}

/**
 * Computes the dashboard stats with exact count queries (scales past the current
 * page) plus one row for the latest result. Pass rate is derived from all-time
 * Passed vs. evaluated (non-Pending) counts.
 */
export async function getWaterQualityStats(
  client: SupabaseClient,
): Promise<WaterQualityStats> {
  const monthStart = monthStartISO()
  const countOptions = { count: 'exact' as const, head: true }
  const base = () =>
    client
      .from(WATER_QUALITY_TABLE)
      .select('id', countOptions)
      .is('deleted_at', null)

  const [latestResult, monthResult, failedResult, passedResult, evaluatedResult] =
    await Promise.all([
      client
        .from(WATER_QUALITY_TABLE)
        .select(WATER_QUALITY_COLUMNS)
        .is('deleted_at', null)
        .order('test_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      base().gte('test_date', monthStart),
      base().eq('status', 'Failed').gte('test_date', monthStart),
      base().eq('status', 'Passed'),
      base().neq('status', 'Pending'),
    ])

  if (
    latestResult.error ||
    monthResult.error ||
    failedResult.error ||
    passedResult.error ||
    evaluatedResult.error
  ) {
    throw new Error(WATER_QUALITY_LOAD_ERROR)
  }

  const latestRow = latestResult.data
    ? toWaterQualityTest(waterQualityRowSchema.parse(latestResult.data))
    : null

  return {
    latest: latestRow
      ? {
          status: latestRow.status,
          method: latestRow.method,
          testDate: latestRow.testDate,
        }
      : null,
    testsThisMonth: monthResult.count ?? 0,
    failedThisMonth: failedResult.count ?? 0,
    passRate: computePassRate(passedResult.count ?? 0, evaluatedResult.count ?? 0),
  }
}

function safeFileName(name: string): string {
  const normalized = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || 'attachment'
}

/**
 * Mirrors one attachment into the Documents module: inserts a `documents` row
 * (category "Water Quality Tests"), then uploads the file to the private bucket.
 * Returns the created document id. Throws on any failure so the caller can roll
 * back the parent test.
 */
async function mirrorAttachment(
  client: SupabaseClient,
  file: File,
  values: WaterQualityFormValues,
  owner: WaterQualityOwner,
): Promise<number> {
  const { data: created, error: insertError } = await client
    .from(DOCUMENTS_TABLE)
    .insert({
      org_id: owner.orgId,
      created_by: owner.createdBy,
      title: buildDocumentTitle(values),
      description: buildDocumentDescription(values),
      category: WATER_QUALITY_DOCUMENT_CATEGORY,
      document_type: 'Water Quality Test Result',
      document_date: values.testDate,
      original_name: file.name,
    })
    .select('id')
    .single()

  if (insertError || !created) throw new Error(WATER_QUALITY_SAVE_ERROR)

  const documentId = created.id as number
  const path = `${owner.orgId}/${documentId}/${crypto.randomUUID()}-${safeFileName(file.name)}`

  const { data: pathRows, error: pathError } = await client
    .from(DOCUMENTS_TABLE)
    .update({ file_path: path })
    .eq('id', documentId)
    .select('id')

  if (pathError || !pathRows?.length) {
    await client
      .from(DOCUMENTS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId)
    throw new Error(WATER_QUALITY_SAVE_ERROR)
  }

  const { error: uploadError } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    await client
      .from(DOCUMENTS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId)
    throw new Error(WATER_QUALITY_SAVE_ERROR)
  }

  return documentId
}

/** Uploads all attachments, mirroring each into Documents. */
async function mirrorAttachments(
  client: SupabaseClient,
  files: File[],
  values: WaterQualityFormValues,
  owner: WaterQualityOwner,
): Promise<number[]> {
  const ids: number[] = []
  for (const file of files) {
    ids.push(await mirrorAttachment(client, file, values, owner))
  }
  return ids
}

/**
 * Inserts a test, mirrors its attachments into Documents, then links the created
 * document ids back onto the test. If any attachment fails, the test is
 * soft-deleted so no orphaned parent remains.
 *
 * ponytail: rollback is best-effort soft-delete of the parent test; already
 * uploaded attachment docs for the same call are left in Documents (they are
 * valid compliance files). Add a full transactional RPC only if orphaned
 * attachments become a real problem.
 */
export async function createTest(
  client: SupabaseClient,
  input: WaterQualityWriteInput,
  owner: WaterQualityOwner,
): Promise<WaterQualityTest> {
  const attachmentError = validateAttachments(input.files)
  if (attachmentError) throw new Error(attachmentError)

  const { data: created, error: insertError } = await client
    .from(WATER_QUALITY_TABLE)
    .insert(toInsertRow(input.values, owner))
    .select(WATER_QUALITY_COLUMNS)
    .single()

  if (insertError || !created) throw new Error(WATER_QUALITY_SAVE_ERROR)

  const test = toWaterQualityTest(waterQualityRowSchema.parse(created))

  if (input.files.length === 0) return test

  try {
    const documentIds = await mirrorAttachments(
      client,
      input.files,
      input.values,
      owner,
    )
    return await linkDocuments(client, test.id, documentIds)
  } catch (error) {
    await client
      .from(WATER_QUALITY_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', test.id)
    throw error
  }
}

/** Writes the mirrored document ids onto the test and returns the fresh row. */
async function linkDocuments(
  client: SupabaseClient,
  id: number,
  documentIds: number[],
): Promise<WaterQualityTest> {
  const { data, error } = await client
    .from(WATER_QUALITY_TABLE)
    .update({ document_ids: documentIds })
    .eq('id', id)
    .is('deleted_at', null)
    .select(WATER_QUALITY_COLUMNS)
    .single()

  if (error) throw new Error(WATER_QUALITY_SAVE_ERROR)

  return toWaterQualityTest(waterQualityRowSchema.parse(data))
}

/**
 * Updates a test's fields. Any newly chosen attachments are mirrored into
 * Documents and appended to the test's `document_ids`. Existing attachments are
 * left in place (remove the whole test to drop them).
 */
export async function updateTest(
  client: SupabaseClient,
  id: number,
  input: WaterQualityWriteInput,
  owner: WaterQualityOwner,
): Promise<WaterQualityTest> {
  const attachmentError = validateAttachments(input.files)
  if (attachmentError) throw new Error(attachmentError)

  const { data, error } = await client
    .from(WATER_QUALITY_TABLE)
    .update(toUpdateRow(input.values))
    .eq('id', id)
    .is('deleted_at', null)
    .select(WATER_QUALITY_COLUMNS)
    .single()

  if (error) throw new Error(WATER_QUALITY_SAVE_ERROR)

  const test = toWaterQualityTest(waterQualityRowSchema.parse(data))

  if (input.files.length === 0) return test

  const newIds = await mirrorAttachments(client, input.files, input.values, owner)
  return linkDocuments(client, id, [...test.documentIds, ...newIds])
}

/**
 * Soft-deletes a test (stamps `deleted_at`). Mirrored attachments remain in the
 * Documents module — they are independent compliance records and are removed
 * from there if needed.
 */
export async function deleteTest(
  client: SupabaseClient,
  id: number,
): Promise<void> {
  const { data, error } = await client
    .from(WATER_QUALITY_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')

  if (error || !data?.length) {
    throw new Error(WATER_QUALITY_DELETE_ERROR)
  }
}

/** Creates a short-lived signed URL to download a mirrored attachment. */
export async function createAttachmentSignedUrl(
  client: SupabaseClient,
  documentId: number,
): Promise<string> {
  const { data: doc, error: docError } = await client
    .from(DOCUMENTS_TABLE)
    .select('file_path')
    .eq('id', documentId)
    .is('deleted_at', null)
    .maybeSingle()

  if (docError || !doc?.file_path) throw new Error(WATER_QUALITY_LOAD_ERROR)

  const { data, error } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(doc.file_path as string, 60)

  if (error) throw new Error(WATER_QUALITY_LOAD_ERROR)

  return data.signedUrl
}
