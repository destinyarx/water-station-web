'use client'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { Document } from '../documents.types'
import { useDeleteDocument } from '../hooks/use-soft-delete-document'

interface DeleteDocumentDialogProps {
  doc: Document | null
  onClose: () => void
}

export function DeleteDocumentDialog({ doc, onClose }: DeleteDocumentDialogProps) {
  const { mutate, isPending, isError, error, reset } = useDeleteDocument()

  if (!doc) return null

  function handleClose(): void {
    reset()
    onClose()
  }

  function handleDelete(): void {
    if (!doc) return
    mutate(doc, { onSuccess: handleClose })
  }

  return (
    <ConfirmDialog
      open={doc !== null}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
      variant="destructive"
      title="Delete this document?"
      description={
        <>
          &ldquo;{doc.title}&rdquo; and its stored file will be permanently deleted. This cannot be undone.
        </>
      }
      confirmLabel="Delete document"
      pendingLabel="Deleting..."
      onConfirm={handleDelete}
      isPending={isPending}
      errorMessage={isError ? error.message : undefined}
    />
  )
}
