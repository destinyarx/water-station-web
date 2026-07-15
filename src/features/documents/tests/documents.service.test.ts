import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createDocument, createDocumentSignedUrl, getActiveDocuments } from '../services/documents.service'
import { documentRowSchema } from '../documents.schema'
import { toDocument } from '../documents.mapper'

const row = {
  id: 1, org_id: '00000000-0000-4000-8000-000000000001', created_by: 'user_1', title: 'Permit', description: null,
  category: 'Business Permits', document_type: null, document_date: null, amount: null, expiry_date: null,
  visibility: 'all', is_approved: false, original_name: 'permit.pdf', file_path: 'org/1/permit.pdf',
  created_at: '2026-07-15T00:00:00Z', updated_at: null, deleted_at: null, uploader: null,
}

describe('documents service', () => {
  it('loads one server-paginated page with an exact total', async () => {
    const range = vi.fn(() => Promise.resolve({ data: [row], count: 21, error: null }))
    const order = vi.fn(() => ({ range }))
    const is = vi.fn(() => ({ order }))
    const select = vi.fn(() => ({ is }))
    const client = { from: vi.fn(() => ({ select })) } as unknown as SupabaseClient
    const page = await getActiveDocuments(client, { active: true, search: '', category: 'all', visibility: 'all', currentUserId: 'user_1', page: 2, perPage: 20 })
    expect(range).toHaveBeenCalledWith(20, 39)
    expect(page).toMatchObject({ total: 21, documents: [{ id: 1, filePath: 'org/1/permit.pdf' }] })
  })

  it('rejects unsupported files before writing metadata', async () => {
    const from = vi.fn()
    const client = { from } as unknown as SupabaseClient
    await expect(createDocument(client, {
      values: { title: 'Permit', category: 'Business Permits', visibility: 'all' },
      file: new File(['plain'], 'permit.txt', { type: 'text/plain' }),
    }, { orgId: row.org_id, createdBy: 'user_1' })).rejects.toThrow(/PDF/)
    expect(from).not.toHaveBeenCalled()
  })

  it('creates a short-lived signed URL for a stored file', async () => {
    const createSignedUrl = vi.fn(() => Promise.resolve({ data: { signedUrl: 'https://signed.example' }, error: null }))
    const client = { storage: { from: () => ({ createSignedUrl }) } } as unknown as SupabaseClient
    const url = await createDocumentSignedUrl(client, toDocument(documentRowSchema.parse(row)))
    expect(createSignedUrl).toHaveBeenCalledWith('org/1/permit.pdf', 60)
    expect(url).toBe('https://signed.example')
  })
})
