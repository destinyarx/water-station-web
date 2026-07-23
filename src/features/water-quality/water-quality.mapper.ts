import type {
  Parameter,
  WaterQualityFormValues,
  WaterQualityInsert,
  WaterQualityOwner,
  WaterQualityRow,
  WaterQualityTest,
  WaterQualityUpdate,
} from './water-quality.types'

/** Normalizes an optional form string to a trimmed value or null. */
function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Method-specific fields are only meaningful for their own method. */
function labFields(values: WaterQualityFormValues) {
  const isLab = values.method === 'lab'
  return {
    lab_name: isLab ? emptyToNull(values.labName) : null,
    report_no: isLab ? emptyToNull(values.reportNo) : null,
    report_date: isLab ? emptyToNull(values.reportDate) : null,
  }
}

function deviceFields(values: WaterQualityFormValues) {
  const isDevice = values.method === 'device'
  return {
    device_type: isDevice ? values.deviceType ?? null : null,
    device_model: isDevice ? emptyToNull(values.deviceModel) : null,
    tested_at: isDevice ? emptyToNull(values.testedAt) : null,
  }
}

function toParameters(values: WaterQualityFormValues): Parameter[] {
  return values.parameters.map((parameter) => ({
    name: parameter.name.trim(),
    value: parameter.value.trim(),
    unit: emptyToNull(parameter.unit),
    refRange: emptyToNull(parameter.refRange),
  }))
}

/** Maps a validated database row to the camelCase display model. */
export function toWaterQualityTest(row: WaterQualityRow): WaterQualityTest {
  return {
    id: row.id,
    orgId: row.org_id,
    createdBy: row.created_by,
    createdByName: row.creator?.name ?? null,
    testDate: row.test_date,
    waterSource: row.water_source,
    method: row.method,
    status: row.status,
    labName: row.lab_name,
    reportNo: row.report_no,
    reportDate: row.report_date,
    deviceType: row.device_type,
    deviceModel: row.device_model,
    testedAt: row.tested_at,
    testedBy: row.tested_by,
    parameters: row.parameters.map((parameter) => ({
      name: parameter.name,
      value: parameter.value,
      unit: parameter.unit ?? null,
      refRange: parameter.refRange ?? null,
    })),
    documentIds: row.document_ids,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

/**
 * Maps validated form values to a snake_case insert payload. Tenant and creator
 * come from the resolved Clerk identity (`owner`), never from form input.
 * `document_ids` starts empty and is populated after attachments are uploaded.
 */
export function toInsertRow(
  values: WaterQualityFormValues,
  owner: WaterQualityOwner,
): WaterQualityInsert {
  return {
    org_id: owner.orgId,
    created_by: owner.createdBy,
    test_date: values.testDate,
    water_source: values.waterSource,
    method: values.method,
    status: values.status,
    ...labFields(values),
    ...deviceFields(values),
    tested_by: emptyToNull(values.testedBy),
    parameters: toParameters(values),
    document_ids: [],
    remarks: emptyToNull(values.remarks),
  }
}

/** Maps validated form values to a snake_case update payload. */
export function toUpdateRow(values: WaterQualityFormValues): WaterQualityUpdate {
  return {
    test_date: values.testDate,
    water_source: values.waterSource,
    method: values.method,
    status: values.status,
    ...labFields(values),
    ...deviceFields(values),
    tested_by: emptyToNull(values.testedBy),
    parameters: toParameters(values),
    remarks: emptyToNull(values.remarks),
  }
}

/** Maps a display model back to editable form values, seeding the edit form. */
export function toFormValues(test: WaterQualityTest): WaterQualityFormValues {
  return {
    testDate: test.testDate,
    waterSource: test.waterSource,
    method: test.method,
    status: test.status,
    labName: test.labName ?? '',
    reportNo: test.reportNo ?? '',
    reportDate: test.reportDate ?? '',
    deviceType: test.deviceType ?? 'TDS Meter',
    deviceModel: test.deviceModel ?? '',
    testedAt: test.testedAt ?? '',
    testedBy: test.testedBy ?? '',
    parameters: test.parameters.map((parameter) => ({
      name: parameter.name,
      value: parameter.value,
      unit: parameter.unit ?? '',
      refRange: parameter.refRange ?? '',
    })),
    remarks: test.remarks ?? '',
  }
}

const methodLabel: Record<WaterQualityFormValues['method'], string> = {
  lab: 'Laboratory',
  device: 'In-house Device',
}

/**
 * Builds the mirrored Documents `description` by concatenating the test's
 * meaningful fields, skipping any empty/optional field so the document reads
 * cleanly on its own. Never emits `undefined`/blank labels.
 */
export function buildDocumentDescription(
  values: WaterQualityFormValues,
): string {
  const lines: string[] = ['Water Quality Test']

  lines.push(`Status: ${values.status}`)
  lines.push(`Water Source: ${values.waterSource}`)
  lines.push(`Method: ${methodLabel[values.method]}`)

  if (values.method === 'lab') {
    const labParts: string[] = []
    if (values.labName?.trim()) labParts.push(`Lab: ${values.labName.trim()}`)
    if (values.reportNo?.trim()) labParts.push(`Report #: ${values.reportNo.trim()}`)
    if (values.reportDate?.trim())
      labParts.push(`Report date: ${values.reportDate.trim()}`)
    if (labParts.length > 0) lines.push(labParts.join(' · '))
  } else {
    const deviceParts: string[] = []
    if (values.deviceType) deviceParts.push(`Device: ${values.deviceType}`)
    if (values.deviceModel?.trim())
      deviceParts.push(`Model: ${values.deviceModel.trim()}`)
    if (values.testedAt?.trim())
      deviceParts.push(`Tested at: ${values.testedAt.trim()}`)
    if (deviceParts.length > 0) lines.push(deviceParts.join(' · '))
  }

  if (values.testedBy?.trim()) lines.push(`Tested by: ${values.testedBy.trim()}`)

  const parameterLines = values.parameters
    .filter((parameter) => parameter.name.trim() && parameter.value.trim())
    .map((parameter) => {
      const unit = parameter.unit?.trim() ? ` ${parameter.unit.trim()}` : ''
      const ref = parameter.refRange?.trim()
        ? ` (Ref ${parameter.refRange.trim()})`
        : ''
      return `  - ${parameter.name.trim()}: ${parameter.value.trim()}${unit}${ref}`
    })
  if (parameterLines.length > 0) {
    lines.push('Parameters:', ...parameterLines)
  }

  if (values.remarks?.trim()) lines.push(`Remarks: ${values.remarks.trim()}`)

  return lines.join('\n')
}

/** A sensible generated Documents title for a mirrored attachment. */
export function buildDocumentTitle(values: WaterQualityFormValues): string {
  return `Water Quality Test — ${values.waterSource} — ${values.testDate}`
}

/**
 * All-time pass rate as an integer percentage: Passed over evaluated
 * (non-Pending) tests. Returns 0 when nothing has been evaluated yet, guarding
 * against divide-by-zero.
 */
export function computePassRate(passed: number, evaluated: number): number {
  if (evaluated <= 0) return 0
  return Math.round((passed / evaluated) * 100)
}

/** First day of the current month as an ISO `yyyy-mm-dd` date string. */
export function monthStartISO(now: Date = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString(
    'en-CA',
  )
}
