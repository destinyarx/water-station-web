'use client'

interface MutationDialogOptions {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MutationSubmitOptions {
  onSuccess?: () => void
}

export interface MutationDialogMutation<TVariables> {
  mutate: (variables: TVariables, options?: MutationSubmitOptions) => void
  reset: () => void
  isPending: boolean
  isError: boolean
  error: Error | null
}

export interface MutationDialogController<TVariables> {
  open: boolean
  onOpenChange: (open: boolean) => void
  submit: (variables: TVariables) => void
  isPending: boolean
  errorMessage?: string
}

export function createMutationDialogController<TVariables>(
  mutation: MutationDialogMutation<TVariables>,
  options: MutationDialogOptions,
): MutationDialogController<TVariables> {
  function onOpenChange(nextOpen: boolean): void {
    options.onOpenChange(nextOpen)

    if (!nextOpen) {
      mutation.reset()
    }
  }

  function submit(variables: TVariables): void {
    mutation.mutate(variables, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return {
    open: options.open,
    onOpenChange,
    submit,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? mutation.error?.message : undefined,
  }
}

export function useMutationDialog<TVariables>(
  mutation: MutationDialogMutation<TVariables>,
  options: MutationDialogOptions,
): MutationDialogController<TVariables> {
  return createMutationDialogController(mutation, options)
}
