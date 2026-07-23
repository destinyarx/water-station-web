import { describe, expect, it } from 'vitest'

import {
  buildDocumentDescription,
  computePassRate,
  monthStartISO,
  toFormValues,
  toInsertRow,
  toWaterQualityTest,
} from '../water-quality.mapper'
import { waterQualityRowSchema } from '../water-quality.schema'
import type {
  WaterQualityFormValues,
  WaterQualityOwner,
} from '../water-quality.types'

const owner: WaterQualityOwner = {
  orgId: '00000000-0000-4000-8000-000000000007',
  createdBy: 'user_2abcDEF',
}

const labValues: WaterQualityFormValues = {
  testDate: '2026-07-20',
  waterSource: 'Filtered',
  method: 'lab',
  status: 'Passed',
  labName: 'AquaLab Inc.',
  reportNo: 'WQ-2026-011',
  reportDate: '2026-07-19',
  deviceType: 'TDS Meter',
  deviceModel: '',
  testedAt: '',
  testedBy: 'Maria Santos',
  parameters: [
    { name: 'pH Level', value: '7.2', unit: '', refRange: '6.5 - 8.5' },
    { name: 'TDS', value: '120', unit: 'ppm', refRange: '≤ 500 ppm' },
  ],
  remarks: 'Routine monthly test.',
}

describe('toInsertRow', () => {
  it('maps ownership and lab fields, nulling device-only fields', () => {
    const row = toInsertRow(labValues, owner)

    expect(row.org_id).toBe(owner.orgId)
    expect(row.created_by).toBe(owner.createdBy)
    expect(row.method).toBe('lab')
    expect(row.lab_name).toBe('AquaLab Inc.')
    expect(row.report_no).toBe('WQ-2026-011')
    expect(row.device_type).toBeNull()
    expect(row.device_model).toBeNull()
    expect(row.tested_at).toBeNull()
    expect(row.document_ids).toEqual([])
    expect(row.parameters).toHaveLength(2)
    expect(row.parameters[1]).toEqual({
      name: 'TDS',
      value: '120',
      unit: 'ppm',
      refRange: '≤ 500 ppm',
    })
  })

  it('nulls lab-only fields when the method is device', () => {
    const row = toInsertRow(
      {
        ...labValues,
        method: 'device',
        deviceModel: 'HM-500',
        testedAt: '2026-07-20T09:00',
      },
      owner,
    )

    expect(row.lab_name).toBeNull()
    expect(row.report_no).toBeNull()
    expect(row.device_type).toBe('TDS Meter')
    expect(row.device_model).toBe('HM-500')
    expect(row.tested_at).toBe('2026-07-20T09:00')
  })
})

describe('buildDocumentDescription', () => {
  it('concatenates meaningful fields and omits empty optional ones', () => {
    const description = buildDocumentDescription(labValues)

    expect(description).toContain('Status: Passed')
    expect(description).toContain('Water Source: Filtered')
    expect(description).toContain('Method: Laboratory')
    expect(description).toContain('Lab: AquaLab Inc.')
    expect(description).toContain('Report #: WQ-2026-011')
    expect(description).toContain('Tested by: Maria Santos')
    expect(description).toContain('- pH Level: 7.2 (Ref 6.5 - 8.5)')
    expect(description).toContain('- TDS: 120 ppm (Ref ≤ 500 ppm)')
    expect(description).toContain('Remarks: Routine monthly test.')
    // No device lines leak into a lab description.
    expect(description).not.toContain('Device:')
    expect(description).not.toContain('undefined')
  })

  it('skips absent optional lab fields cleanly', () => {
    const description = buildDocumentDescription({
      ...labValues,
      reportDate: '',
      remarks: '',
    })
    expect(description).not.toContain('Report date:')
    expect(description).not.toContain('Remarks:')
  })
})

describe('computePassRate', () => {
  it('returns an integer percentage of passed over evaluated', () => {
    expect(computePassRate(9, 10)).toBe(90)
    expect(computePassRate(1, 3)).toBe(33)
  })

  it('returns 0 when nothing has been evaluated (no divide-by-zero)', () => {
    expect(computePassRate(0, 0)).toBe(0)
  })
})

describe('monthStartISO', () => {
  it('returns the first day of the given month', () => {
    expect(monthStartISO(new Date(2026, 6, 22))).toBe('2026-07-01')
  })
})

describe('toWaterQualityTest / toFormValues round-trip', () => {
  it('maps a db row to the display model and back to form values', () => {
    const row = waterQualityRowSchema.parse({
      id: 1001,
      org_id: owner.orgId,
      created_by: owner.createdBy,
      test_date: '2026-07-20',
      water_source: 'Filtered',
      method: 'lab',
      status: 'Passed',
      lab_name: 'AquaLab Inc.',
      report_no: 'WQ-2026-011',
      report_date: '2026-07-19',
      device_type: null,
      device_model: null,
      tested_at: null,
      tested_by: 'Maria Santos',
      parameters: [{ name: 'pH Level', value: 7.2, unit: null, refRange: '6.5 - 8.5' }],
      document_ids: [5, 6],
      remarks: null,
      created_at: '2026-07-20T00:00:00.000Z',
      updated_at: null,
      deleted_at: null,
      creator: { name: 'Maria Santos' },
    })

    const test = toWaterQualityTest(row)
    expect(test.createdByName).toBe('Maria Santos')
    expect(test.documentIds).toEqual([5, 6])
    expect(test.parameters[0].value).toBe('7.2')

    const form = toFormValues(test)
    expect(form.labName).toBe('AquaLab Inc.')
    expect(form.parameters[0]).toEqual({
      name: 'pH Level',
      value: '7.2',
      unit: '',
      refRange: '6.5 - 8.5',
    })
  })
})
