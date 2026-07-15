import { describe, expect, it } from 'vitest'

import { toDocument, toInsertRow, toUpdateRow } from '../documents.mapper'

const row = {
  id: 1, org_id: '00000000-0000-4000-8000-000000000001', created_by: 'user_1', title: 'Permit', description: null,
  category: 'Business Permits' as const, document_type: null, document_date: null, amount: null, expiry_date: null,
  visibility: 'all' as const, is_approved: false, original_name: 'permit.pdf', file_path: 'org/1/permit.pdf',
  created_at: '2026-07-15T00:00:00Z', updated_at: null, deleted_at: null, uploader: { name: 'Ana' },
}
const values = { title: ' Permit ', description: '', category: 'Business Permits' as const, documentType: '', documentDate: '', amount: undefined, expiryDate: '', visibility: 'all' as const }

describe('document mappers', () => {
  it('maps storage and uploader fields', () => {
    expect(toDocument(row)).toMatchObject({ filePath: 'org/1/permit.pdf', uploaderName: 'Ana' })
  })
  it('sets ownership and original name only during insert', () => {
    expect(toInsertRow(values, { orgId: row.org_id, createdBy: 'user_1' }, 'permit.pdf')).toMatchObject({ org_id: row.org_id, created_by: 'user_1', original_name: 'permit.pdf' })
    expect(toUpdateRow(values)).not.toHaveProperty('updated_at')
  })
})
