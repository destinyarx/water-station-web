'use client'

import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { submitRegistration } from '../services/registration.service'
import { isRegistered } from '../registration.guards'
import { POST_REGISTRATION_PATH } from '../registration.constants'
import type {
  RegistrationInput,
  RegistrationSessionClaims,
} from '../registration.types'

function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return (
      data?.message ??
      error.message ??
      'Something went wrong while completing your registration.'
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong while completing your registration.'
}

/** Decodes the claims payload of a Clerk JWT without verifying the signature. */
function decodeClaims(token: string): RegistrationSessionClaims | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as RegistrationSessionClaims
  } catch {
    return null
  }
}

export function useCompleteRegistration(): UseMutationResult<
  void,
  Error,
  RegistrationInput
> {
  const { getToken, sessionClaims } = useAuth()

  return useMutation<void, Error, RegistrationInput>({
    mutationFn: async (input) => {
      const token = await getToken()
      if (!token) {
        throw new Error('You must be signed in to complete registration.')
      }

      const identity = {
        name: sessionClaims?.name ?? '',
        email: sessionClaims?.email ?? '',
      }

      try {
        await submitRegistration(input, token, identity)
      } catch (error) {
        throw new Error(toErrorMessage(error))
      }

      // The edge function updated `public_metadata`, but the cached token is now
      // stale. Force a fresh token and confirm the claims actually landed before
      // navigating — otherwise middleware would bounce us back to the form.
      const freshToken = await getToken({ skipCache: true })
      const freshClaims = freshToken ? decodeClaims(freshToken) : null

      if (!isRegistered(freshClaims)) {
        throw new Error(
          'Your registration was saved but is still finalizing. Please refresh the page in a moment.',
        )
      }
    },
    onSuccess: () => {
      // Hard-navigate so the new claims are read server-side on the next request.
      window.location.assign(POST_REGISTRATION_PATH)
    },
  })
}
