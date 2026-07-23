'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import {
  canDeleteWaterQualityTest,
  canEditWaterQualityTest,
  type WaterQualityActor,
} from '../water-quality.guards'
import type { WaterQualityTest } from '../water-quality.types'

interface WaterQualityRowActionsProps {
  test: WaterQualityTest
  actor: WaterQualityActor | null
  onView: (test: WaterQualityTest) => void
  onEdit: (test: WaterQualityTest) => void
  onDelete: (test: WaterQualityTest) => void
}

export function WaterQualityRowActions({ test, actor, onView, onEdit, onDelete }: WaterQualityRowActionsProps) {
  const canManage = canEditWaterQualityTest(test, actor)
  const canRemove = canDeleteWaterQualityTest(test, actor)

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
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onView(test)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(test)} disabled={!canManage}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
          </svg>
          Edit
        </DropdownMenuItem>
        {canRemove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(test)} className="text-destructive focus:text-destructive">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
