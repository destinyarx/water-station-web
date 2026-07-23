import { describe, expect, it } from 'vitest'

import {
  validateAttachments,
  waterQualityFormSchema,
} from '../water-quality.schema'
import { waterQualityFormDefaults } from '../water-quality.constants'

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA')
}

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-CA')
}

const validLab = {
  ...waterQualityFormDefaults(),
  testDate: yesterday(),
  method: 'lab' as const,
  status: 'Passed' as const,
  labName: 'AquaLab Inc.',
  reportNo: 'WQ-2026-011',
  testedBy: 'Maria Santos',
  parameters: [{ name: 'pH Level', value: '7.2', unit: '', refRange: '6.5 - 8.5' }],
}

describe('waterQualityFormSchema', () => {
  it('accepts a valid laboratory record', () => {
    expect(waterQualityFormSchema.safeParse(validLab).success).toBe(true)
  })

  it('defaults status to Pending in the blank form', () => {
    expect(waterQualityFormDefaults().status).toBe('Pending')
  })

  it('rejects a future test date', () => {
    const result = waterQualityFormSchema.safeParse({
      ...validLab,
      testDate: tomorrow(),
    })
    expect(result.success).toBe(false)
  })

  it('requires lab name and report number for the lab method', () => {
    const result = waterQualityFormSchema.safeParse({
      ...validLab,
      labName: '',
      reportNo: '',
    })
    expect(result.success).toBe(false)
  })

  it('requires a tested-at timestamp for the device method', () => {
    const result = waterQualityFormSchema.safeParse({
      ...validLab,
      method: 'device',
      testedAt: '',
    })
    expect(result.success).toBe(false)
  })

  it('allows a blank device model for the device method', () => {
    const result = waterQualityFormSchema.safeParse({
      ...validLab,
      method: 'device',
      deviceType: 'TDS Meter',
      deviceModel: '',
      testedAt: '2026-01-05T09:30',
    })
    expect(result.success).toBe(true)
  })

  it('requires at least one parameter', () => {
    const result = waterQualityFormSchema.safeParse({
      ...validLab,
      parameters: [],
    })
    expect(result.success).toBe(false)
  })

  it('requires tested by', () => {
    const result = waterQualityFormSchema.safeParse({
      ...validLab,
      testedBy: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('validateAttachments', () => {
  it('accepts an empty set', () => {
    expect(validateAttachments([])).toBeNull()
  })

  it('accepts allowed types within the combined size cap', () => {
    expect(
      validateAttachments([
        { size: 1_000_000, type: 'application/pdf' },
        { size: 1_000_000, type: 'image/png' },
      ]),
    ).toBeNull()
  })

  it('rejects a disallowed file type', () => {
    expect(
      validateAttachments([{ size: 100, type: 'text/plain' }]),
    ).toMatch(/PDF, PNG, JPG, or WEBP/)
  })

  it('rejects a combined size of 3MB or more', () => {
    expect(
      validateAttachments([
        { size: 2_000_000, type: 'image/jpeg' },
        { size: 2_000_000, type: 'image/jpeg' },
      ]),
    ).toMatch(/under 3MB/)
  })
})
