'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface FailDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  errorMessage?: string
  onConfirm: (remarks: string) => void
}

export function FailDeliveryDialog({
  open,
  onOpenChange,
  isPending,
  errorMessage,
  onConfirm,
}: FailDeliveryDialogProps) {
  const [remarks, setRemarks] = useState('')
  const trimmed = remarks.trim()

  // Clear on any close path (overlay, escape, cancel) so reopening starts fresh.
  function handleOpenChange(next: boolean) {
    if (!next) setRemarks('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark delivery as failed</DialogTitle>
          <DialogDescription>
            Record why this delivery did not go through. Any deducted stock is
            restored.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="failure-remarks">Reason</Label>
          <textarea
            id="failure-remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            rows={3}
            placeholder="e.g. Customer not home, gate closed."
            className="w-full rounded-xl border border-[#dcecff] bg-white px-3 py-2 text-sm text-[#001d34] outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20"
          />
          {errorMessage ? (
            <p role="alert" className="text-sm text-red-600">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={isPending || trimmed === ''}
            className="bg-[#e5484d] text-white hover:bg-[#cf3c41]"
          >
            {isPending ? 'Saving...' : 'Mark failed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
