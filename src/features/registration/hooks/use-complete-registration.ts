'use client'

import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { submitRegistration } from '../services/registration.service'
import { POST_REGISTRATION_PATH } from '../registration.constants'
import type { RegistrationInput } from '../registration.types'

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

export function useCompleteRegistration(): UseMutationResult<
  void,
  Error,
  RegistrationInput
> {
  const { getToken } = useAuth()

  return useMutation<void, Error, RegistrationInput>({
    mutationFn: async (input) => {
      const token = await getToken();
      // const token = await getToken({ template: "water-station" });
      if (!token) {
        throw new Error('You must be signed in to complete registration.')
      }

      try {
        await submitRegistration(input, token)
      } catch (error) {
        throw new Error(toErrorMessage(error))
      }

      // The edge function updated the session-token claims, but the cached
      // token is now stale. Force a fresh token so middleware re-evaluates the
      // gate, then hard-navigate so the new claims are read on the next request.
      await getToken({ skipCache: true })
    },
    onSuccess: () => {
      window.location.assign(POST_REGISTRATION_PATH)
    },
  })
}
