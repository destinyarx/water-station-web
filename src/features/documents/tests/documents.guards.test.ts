import { describe, expect, it } from 'vitest'

import { canApproveDocument, canManageDocument } from '../documents.guards'
import type { Document } from '../documents.types'

const doc: Document = {
  id: 1, orgId: '00000000-0000-4000-8000-000000000001', createdBy: 'user_staff', uploaderName: null,
  title: 'Permit', description: null, category: 'Business Permits', documentType: null, documentDate: null,
  amount: null, expiryDate: null, visibility: 'all', isApproved: false, originalName: 'permit.pdf',
  filePath: 'org/1/permit.pdf', createdAt: '2026-07-15T00:00:00Z', updatedAt: null, deletedAt: null,
}

describe('document guards', () => {
  it('allows the creator and owner to manage an active document', () => {
    expect(canManageDocument(doc, { userId: 'user_staff', isOwner: false })).toBe(true)
    expect(canManageDocument(doc, { userId: 'user_owner', isOwner: true })).toBe(true)
  })
  it('blocks other staff and archived documents', () => {
    expect(canManageDocument(doc, { userId: 'user_other', isOwner: false })).toBe(false)
    expect(canManageDocument({ ...doc, deletedAt: '2026-07-15T01:00:00Z' }, { userId: 'user_owner', isOwner: true })).toBe(false)
  })
  it('limits approval to owners', () => {
    expect(canApproveDocument(doc, { userId: 'user_owner', isOwner: true })).toBe(true)
    expect(canApproveDocument(doc, { userId: 'user_staff', isOwner: false })).toBe(false)
  })
})
