import { z } from 'zod'

import {
  WATER_QUALITY_ACCEPTED_MIME_TYPES,
  WATER_QUALITY_ATTACHMENT_MAX_TOTAL,
  deviceTypeValues,
  methodValues,
  statusValues,
  waterSourceValues,
} from './water-quality.constants'

/** A single stored parameter reading (informational; no derived status). */
export const parameterRowSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number()]).transform((v) => String(v)),
  unit: z.string().nullable().optional(),
  refRange: z.string().nullable().optional(),
})

/**
 * Shape of a `public.water_quality_tests` row as returned by Supabase, validated
 * before it crosses into the UI so a malformed payload fails loudly.
 */
export const waterQualityRowSchema = z.object({
  id: z.number().int(),
  org_id: z.string().uuid(),
  created_by: z.string().max(255),
  test_date: z.string(),
  water_source: z.enum(waterSourceValues),
  method: z.enum(methodValues),
  status: z.enum(statusValues),
  lab_name: z.string().nullable(),
  report_no: z.string().nullable(),
  report_date: z.string().nullable(),
  device_type: z.enum(deviceTypeValues).nullable(),
  device_model: z.string().nullable(),
  tested_at: z.string().nullable(),
  tested_by: z.string().nullable(),
  parameters: z.array(parameterRowSchema).default([]),
  document_ids: z.array(z.number().int()).default([]),
  remarks: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
  creator: z.object({ name: z.string().nullable() }).nullable().optional(),
})

/** Whether an ISO `yyyy-mm-dd` date is today or earlier (never in the future). */
function isNotFuture(dateStr: string): boolean {
  const today = new Date().toLocaleDateString('en-CA')
  return dateStr <= today
}

const parameterFormSchema = z.object({
  name: z.string().trim().min(1, 'Parameter name is required.').max(60),
  value: z.string().trim().min(1, 'Value is required.').max(40),
  unit: z.string().trim().max(20).optional(),
  refRange: z.string().trim().max(50).optional(),
})

/**
 * Validation for the create/edit water quality form. Backs both the React Hook
 * Form UI and the service-layer input so client/server validation cannot drift.
 * Overall `status` is user-entered (default Pending) — never derived.
 */
export const waterQualityFormSchema = z
  .object({
    testDate: z
      .string()
      .min(1, 'Test date is required.')
      .refine(isNotFuture, 'Test date cannot be in the future.'),
    waterSource: z.enum(waterSourceValues, {
      message: 'Select a water source.',
    }),
    method: z.enum(methodValues),
    status: z.enum(statusValues),
    labName: z.string().trim().max(200).optional(),
    reportNo: z.string().trim().max(100).optional(),
    reportDate: z.string().trim().optional(),
    deviceType: z.enum(deviceTypeValues).optional(),
    deviceModel: z.string().trim().max(200).optional(),
    testedAt: z.string().trim().optional(),
    testedBy: z
      .string()
      .trim()
      .min(1, 'Tested by is required.')
      .max(200),
    parameters: z
      .array(parameterFormSchema)
      .min(1, 'Add at least one parameter.'),
    remarks: z.string().trim().max(1000).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.method === 'lab') {
      if (!values.labName || values.labName.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['labName'],
          message: 'Laboratory name is required.',
        })
      }
      if (!values.reportNo || values.reportNo.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['reportNo'],
          message: 'Report number is required.',
        })
      }
    }

    if (values.method === 'device') {
      if (!values.deviceType) {
        ctx.addIssue({
          code: 'custom',
          path: ['deviceType'],
          message: 'Device type is required.',
        })
      }
      if (!values.testedAt || values.testedAt.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['testedAt'],
          message: 'Tested at is required.',
        })
      }
    }
  })

/**
 * Validates a set of attachments against the accepted types and combined-size
 * cap. Returns a user-facing error message, or null when the set is valid. A
 * plain shape (not `File`) keeps this pure and unit-testable.
 */
export function validateAttachments(
  files: ReadonlyArray<{ size: number; type: string }>,
): string | null {
  const badType = files.find(
    (file) =>
      !WATER_QUALITY_ACCEPTED_MIME_TYPES.some((type) => type === file.type),
  )
  if (badType) {
    return 'Attachments must be PDF, PNG, JPG, or WEBP files.'
  }

  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > WATER_QUALITY_ATTACHMENT_MAX_TOTAL) {
    return 'Attachments must be under 3MB in total.'
  }

  return null
}
