'use client'

import { useAuth } from '@clerk/nextjs'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import type { Document } from '../documents.types'
import { useApproveDocument } from '../hooks/use-approve-document'
import { useOpenDocument } from '../hooks/use-open-document'
import { canApproveDocument, canManageDocument } from '../documents.guards'

interface DocumentRowActionsProps {
  doc: Document
  onEdit: (doc: Document) => void
  onDelete: (doc: Document) => void
}

export function DocumentRowActions({ doc, onEdit, onDelete }: DocumentRowActionsProps) {
  const { userId, sessionClaims } = useAuth()
  const actor = userId ? { userId, isOwner: sessionClaims?.is_owner === true } : null
  const canManage = canManageDocument(doc, actor)
  const canApprove = canApproveDocument(doc, actor)

  const { mutate: approve, isPending: approvePending } = useApproveDocument()
  const { mutate: openDocument, isPending: openPending } = useOpenDocument()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--app-text-soft)]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => openDocument(doc)} disabled={!doc.filePath || openPending}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>
          Open file
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(doc)} disabled={!canManage}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
          </svg>
          Edit
        </DropdownMenuItem>

        {canApprove && (
          <DropdownMenuItem
            onClick={() => approve({ id: doc.id, isApproved: !doc.isApproved })}
            disabled={approvePending}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {doc.isApproved ? 'Mark as unreviewed' : 'Mark as approved'}
          </DropdownMenuItem>
        )}

        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(doc)}
              className="text-destructive focus:text-destructive"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Archive
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
