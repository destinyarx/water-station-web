'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { deliveryKeys } from '../deliveries.keys'
import { topUpActiveSchedules } from '../services/delivery-materialize.service'
import { useDeliveryOwner } from './use-delivery-owner'

/**
 * Runs the rolling materialization top-up once per mount of the deliveries
 * view, per ADR 0002. Deliveries queries are only invalidated when occurrences
 * were actually created, so the common no-op case costs one read.
 */
export function useScheduleTopUp(): void {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const queryClient = useQueryClient()
  const hasRun = useRef(false)

  useEffect(() => {
    if (owner == null || hasRun.current) return
    hasRun.current = true

    topUpActiveSchedules(client, owner, new Date().toLocaleDateString('en-CA'))
      .then((created) => {
        if (created > 0) {
          queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
        }
      })
      .catch(() => {
        // ponytail: a failed top-up must not break the queue the user came for;
        // the next visit retries. Surface it if support ever needs the signal.
        hasRun.current = false
      })
  }, [client, owner, queryClient])
}
