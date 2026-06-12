'use client'

import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useRevealOnScroll } from '../hooks/use-reveal-on-scroll'

export function Reveal({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  const ref = useRevealOnScroll<HTMLElement>()
  return (
    <Tag ref={ref} className={cn('aqua-reveal', className)}>
      {children}
    </Tag>
  )
}
