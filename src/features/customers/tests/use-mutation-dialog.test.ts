import { describe, expect, it, vi } from 'vitest'

import {
  createMutationDialogController,
  type MutationDialogMutation,
} from '../hooks/use-mutation-dialog'

function createMutation<TVariables>(
  state: Partial<
    Pick<MutationDialogMutation<TVariables>, 'isPending' | 'isError' | 'error'>
  > = {},
) {
  let onSuccess: (() => void) | undefined
  const reset = vi.fn()
  const mutate = vi.fn(
    (_variables: TVariables, options?: { onSuccess?: () => void }) => {
      onSuccess = options?.onSuccess
    },
  )

  const mutation: MutationDialogMutation<TVariables> = {
    mutate,
    reset,
    isPending: state.isPending ?? false,
    isError: state.isError ?? false,
    error: state.error ?? null,
  }

  return {
    mutation,
    mutate,
    reset,
    runSuccess: () => onSuccess?.(),
  }
}

describe('createMutationDialogController', () => {
  it('forwards open state changes and resets the mutation when closed', () => {
    const { mutation, reset } = createMutation<string>()
    const onOpenChange = vi.fn()
    const controller = createMutationDialogController(mutation, {
      open: true,
      onOpenChange,
    })

    controller.onOpenChange(false)

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('does not reset the mutation when opened', () => {
    const { mutation, reset } = createMutation<string>()
    const onOpenChange = vi.fn()
    const controller = createMutationDialogController(mutation, {
      open: false,
      onOpenChange,
    })

    controller.onOpenChange(true)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(reset).not.toHaveBeenCalled()
  })

  it('submits variables and closes only after mutation success', () => {
    const { mutation, mutate, reset, runSuccess } = createMutation<string>()
    const onOpenChange = vi.fn()
    const controller = createMutationDialogController(mutation, {
      open: true,
      onOpenChange,
    })

    controller.submit('customer-form-values')

    expect(mutate).toHaveBeenCalledWith(
      'customer-form-values',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()

    runSuccess()

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(reset).toHaveBeenCalledOnce()
  })

  it('exposes pending state and user-facing error message', () => {
    const { mutation } = createMutation<string>({
      isPending: true,
      isError: true,
      error: new Error('Unable to save customer. Please try again.'),
    })

    const controller = createMutationDialogController(mutation, {
      open: true,
      onOpenChange: vi.fn(),
    })

    expect(controller.isPending).toBe(true)
    expect(controller.errorMessage).toBe(
      'Unable to save customer. Please try again.',
    )
  })
})
