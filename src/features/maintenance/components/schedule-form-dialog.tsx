'use client'

import { AppModal } from '@/components/app/app-modal'

interface ScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: React.ReactNode
}

const WRENCH_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M14.7 6.3a3.7 3.7 0 0 0-4.9 4.6L4 16.7 7.3 20l5.8-5.8a3.7 3.7 0 0 0 4.6-4.9l-2.4 2.4-2-2 2.4-2.4Z" /></svg>
)

/**
 * Custom modal chrome for the maintenance create/edit forms — overlay, brand
 * header, Escape-to-close. App-themed so it follows dark mode. The form is
 * passed as children and owns its own mutation.
 */
export function ScheduleFormDialog({ open, onOpenChange, title, description, children }: ScheduleFormDialogProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="lg"
      bodyPadding={0}
      icon={WRENCH_ICON}
    >
      {children}
    </AppModal>
  )
}
