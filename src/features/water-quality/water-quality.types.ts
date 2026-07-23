import type { z } from 'zod'

import type {
  waterQualityFormSchema,
  waterQualityRowSchema,
} from './water-quality.schema'
import type {
  deviceTypeValues,
  methodValues,
  statusValues,
  waterSourceValues,
} from './water-quality.constants'

export type WaterSource = (typeof waterSourceValues)[number]
export type TestMethod = (typeof methodValues)[number]
export type TestStatus = (typeof statusValues)[number]
export type DeviceType = (typeof deviceTypeValues)[number]

/** A raw validated `public.water_quality_tests` row. */
export type WaterQualityRow = z.infer<typeof waterQualityRowSchema>

/** Raw field values the form holds before Zod transforms them. */
export type WaterQualityFormInput = z.input<typeof waterQualityFormSchema>

/** Validated values produced by the create/edit form. */
export type WaterQualityFormValues = z.output<typeof waterQualityFormSchema>

/** A single measured parameter (informational). */
export interface Parameter {
  name: string
  value: string
  unit: string | null
  refRange: string | null
}

/**
 * Tenant + creator context resolved from the Clerk session, applied server-side.
 * Never sourced from form input so a client cannot spoof the tenant or creator
 * (RLS also enforces this).
 */
export interface WaterQualityOwner {
  orgId: string
  createdBy: string
}

/** Snake_case payload written to `public.water_quality_tests` (insert). */
export interface WaterQualityInsert {
  org_id: string
  created_by: string
  test_date: string
  water_source: WaterSource
  method: TestMethod
  status: TestStatus
  lab_name: string | null
  report_no: string | null
  report_date: string | null
  device_type: DeviceType | null
  device_model: string | null
  tested_at: string | null
  tested_by: string | null
  parameters: Parameter[]
  document_ids: number[]
  remarks: string | null
}

/** Snake_case payload sent in an update (ownership columns omitted). */
export type WaterQualityUpdate = Omit<
  WaterQualityInsert,
  'org_id' | 'created_by' | 'document_ids'
>

/** Display model consumed by the UI (camelCase). */
export interface WaterQualityTest {
  id: number
  orgId: string
  createdBy: string
  createdByName: string | null
  testDate: string
  waterSource: WaterSource
  method: TestMethod
  status: TestStatus
  labName: string | null
  reportNo: string | null
  reportDate: string | null
  deviceType: DeviceType | null
  deviceModel: string | null
  testedAt: string | null
  testedBy: string | null
  parameters: Parameter[]
  documentIds: number[]
  remarks: string | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

/** Create/update input: validated form values plus the chosen attachment files. */
export interface WaterQualityWriteInput {
  values: WaterQualityFormValues
  files: File[]
}

export interface WaterQualityPage {
  tests: WaterQualityTest[]
  total: number
}

/** The single most-recent test, reduced to the dashboard hero's needs. */
export interface LatestResult {
  status: TestStatus
  method: TestMethod
  testDate: string
}

export interface WaterQualityStats {
  latest: LatestResult | null
  testsThisMonth: number
  failedThisMonth: number
  /** All-time pass rate as an integer percentage (Passed / non-Pending). */
  passRate: number
}
