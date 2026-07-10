'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { registrationSchema } from '../registration.schema'
import { useCompleteRegistration } from '../hooks/use-complete-registration'
import type { RegistrationInput } from '../registration.types'

export function CompleteRegistrationForm() {
  const mutation = useCompleteRegistration()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { isOwner: true, organizationName: '' },
  })

  const isOwner = watch('isOwner')
  const isPending = mutation.isPending || isSubmitting

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values)
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5.5">
      <fieldset disabled={isPending} className="m-0 flex flex-col gap-2.75 border-none p-0">
        <legend className="mb-0.75 p-0 text-sm font-semibold text-(--lp-text)">
          How will you use AquaFlow?
        </legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          <RoleOption
            label="I'm an owner"
            description="I run a water refilling station."
            selected={isOwner === true}
            onSelect={() => setValue('isOwner', true, { shouldValidate: false })}
          />
          <RoleOption
            label="I'm a staff"
            description="I work at an existing station."
            selected={isOwner === false}
            onSelect={() => setValue('isOwner', false, { shouldValidate: false })}
          />
        </div>
      </fieldset>

      {isOwner ? (
        <Field
          id="organizationName"
          label="Water station name"
          placeholder="e.g. Crystal Springs Refilling Station"
          disabled={isPending}
          invalid={'organizationName' in errors}
          error={getError(errors, 'organizationName')}
          {...register('organizationName')}
        />
      ) : (
        <>
          <Field
            id="organizationCode"
            label="Water station code"
            placeholder="Provided by your station owner"
            disabled={isPending}
            invalid={'organizationCode' in errors}
            error={getError(errors, 'organizationCode')}
            {...register('organizationCode')}
          />
          <Field
            id="contactNumber"
            label="Contact number"
            type="tel"
            placeholder="e.g. 0917 123 4567"
            disabled={isPending}
            invalid={'contactNumber' in errors}
            error={getError(errors, 'contactNumber')}
            {...register('contactNumber')}
          />
        </>
      )}

      {mutation.isError ? (
        <p
          role="alert"
          className="m-0 rounded-[10px] border border-(--app-chip-red-text) bg-(--app-chip-red-bg) px-3 py-2.5 text-[13.5px] text-(--app-chip-red-text)"
        >
          {mutation.error.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[13px] bg-linear-to-br from-[#38bdf8] to-[#0a6cc4] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(14,108,196,0.32)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isPending ? 'Completing…' : 'Complete registration'}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  invalid,
  className,
  ...props
}: {
  id: string
  label: string
  error?: string
  invalid?: boolean
} & React.ComponentProps<'input'>) {
  return (
    <div className="flex flex-col gap-1.75">
      <label htmlFor={id} className="text-[13.5px] font-semibold text-(--lp-text)">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={invalid}
        className={cn(
          'h-11 w-full rounded-xl border bg-(--lp-surface-2) px-3.5 text-[15px] text-(--lp-text) outline-none transition-[border-color,box-shadow] placeholder:text-(--lp-text-faint) focus:border-(--lp-brand-text) focus:shadow-[0_0_0_3px_var(--lp-chip-bg)] disabled:cursor-not-allowed disabled:opacity-60',
          invalid ? 'border-(--app-chip-red-text)' : 'border-(--lp-border-strong)',
          className,
        )}
        {...props}
      />
      <FieldError message={error} />
    </div>
  )
}

function RoleOption({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'rounded-[14px] p-3.5 text-left transition-[border-color,background]',
        selected
          ? 'border-[1.5px] border-(--lp-brand-text) bg-(--lp-chip-bg)'
          : 'border border-(--lp-border-strong) bg-(--lp-surface) hover:border-(--lp-brand-text)',
      )}
    >
      <span className="block text-sm font-semibold text-(--lp-text)">{label}</span>
      <span className="mt-0.75 block text-[12.5px] text-(--lp-text-soft)">{description}</span>
    </button>
  )
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return <p className="m-0 text-[13px] text-(--app-chip-red-text)">{message}</p>
}

function getError(
  errors: Record<string, { message?: string } | undefined>,
  field: string,
): string | undefined {
  return errors[field]?.message
}
