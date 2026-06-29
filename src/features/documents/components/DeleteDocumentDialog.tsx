'use client'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { Document } from '../documents.types'
import { useSoftDeleteDocument } from '../hooks/use-soft-delete-document'

interface DeleteDocumentDialogProps {
  doc: Document | null
  onClose: () => void
}

export function DeleteDocumentDialog({ doc, onClose }: DeleteDocumentDialogProps) {
  const { mutate, isPending, isError, error, reset } = useSoftDeleteDocument()

  if (!doc) return null

  function handleClose(): void {
    reset()
    onClose()
  }

  function handleDelete(): void {
    if (!doc) return
    mutate(doc.id, { onSuccess: handleClose })
  }

  return (
    <ConfirmDialog
      open={doc !== null}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
      variant="destructive"
      title="Archive this document?"
      description={
        <>
          &ldquo;{doc.title}&rdquo; will be removed from your records.
        </>
      }
      confirmLabel="Yes, archive"
      pendingLabel="Archiving..."
      onConfirm={handleDelete}
      isPending={isPending}
      errorMessage={isError ? error.message : undefined}
    />
  )
}
