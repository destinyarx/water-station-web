import type { Document } from './documents.types'

export interface DocumentActor {
  userId: string
  isOwner: boolean
}

export function canManageDocument(doc: Document, actor: DocumentActor | null): boolean {
  return actor != null && doc.deletedAt == null && (actor.isOwner || doc.createdBy === actor.userId)
}

export function canApproveDocument(doc: Document, actor: DocumentActor | null): boolean {
  return actor != null && actor.isOwner && doc.deletedAt == null
}
