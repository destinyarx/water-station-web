/** Supabase table backing the water quality test feature. */
export const WATER_QUALITY_TABLE = 'water_quality_tests'

/** Reused Documents bucket + table for mirrored attachments (decisions.md §4). */
export const DOCUMENTS_TABLE = 'documents'
export const DOCUMENTS_BUCKET = 'documents'

/** The exact `documents.category` value water quality attachments are filed under. */
export const WATER_QUALITY_DOCUMENT_CATEGORY = 'Water Quality Tests'

/** Columns selected for the read path, matching `waterQualityRowSchema`. */
export const WATER_QUALITY_COLUMNS =
  'id, org_id, created_by, test_date, water_source, method, status, lab_name, report_no, report_date, device_type, device_model, tested_at, tested_by, parameters, document_ids, remarks, created_at, updated_at, deleted_at, creator:users!created_by(name)'

export const waterSourceValues = [
  'Raw Water',
  'Filtered',
  'Finished Product',
  'Storage Tank',
  'Other',
] as const

export const methodValues = ['lab', 'device'] as const

export const statusValues = ['Passed', 'Warning', 'Failed', 'Pending'] as const

export const deviceTypeValues = [
  'TDS Meter',
  'pH Meter',
  'Turbidity',
  'Other',
] as const

/** Suggested (non-exhaustive) parameter names offered as quick-add chips. */
export const suggestedParameterNames = [
  'pH Level',
  'TDS',
  'Turbidity',
  'Chlorine',
] as const

/** Combined attachment size cap: sum of all files must be under 3MB (decisions.md §4). */
export const WATER_QUALITY_ATTACHMENT_MAX_TOTAL = 3 * 1024 * 1024

export const WATER_QUALITY_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

/** User-facing error messages (raw database errors are never surfaced). */
export const WATER_QUALITY_LOAD_ERROR =
  'Unable to load water quality tests. Please try again.'
export const WATER_QUALITY_SAVE_ERROR =
  'Unable to save water quality test. Please try again.'
export const WATER_QUALITY_DELETE_ERROR =
  'Unable to delete water quality test. Please try again.'

/** Blank Add-form values. A function so `testDate` is today's date at open time. */
export function waterQualityFormDefaults() {
  return {
    testDate: new Date().toLocaleDateString('en-CA'),
    waterSource: 'Finished Product' as (typeof waterSourceValues)[number],
    method: 'lab' as (typeof methodValues)[number],
    status: 'Pending' as (typeof statusValues)[number],
    labName: '',
    reportNo: '',
    reportDate: '',
    deviceType: 'TDS Meter' as (typeof deviceTypeValues)[number],
    deviceModel: '',
    testedAt: '',
    testedBy: '',
    // Empty by design: the user picks a suggested parameter or adds a custom one.
    parameters: [] as { name: string; value: string; unit: string; refRange: string }[],
    remarks: '',
  }
}
