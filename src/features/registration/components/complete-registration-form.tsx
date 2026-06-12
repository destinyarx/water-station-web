'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { registrationSchema } from '../registration.schema'
import { GENDERS, GENDER_LABELS } from '../registration.constants'
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
    defaultValues: { isOwner: true, waterStationName: '' },
  })

  const isOwner = watch('isOwner')
  const isPending = mutation.isPending || isSubmitting

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <fieldset className="space-y-3" disabled={isPending}>
        <legend className="text-sm font-medium text-ink">
          How will you use AquaFlow?
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <RoleOption
            label="I'm an owner"
            description="I run a water refilling station."
            selected={isOwner === true}
            onSelect={() =>
              setValue('isOwner', true, { shouldValidate: false })
            }
          />
          <RoleOption
            label="I'm a staff"
            description="I work at an existing station."
            selected={isOwner === false}
            onSelect={() =>
              setValue('isOwner', false, { shouldValidate: false })
            }
          />
        </div>
      </fieldset>

      {isOwner ? (
        <div className="space-y-2">
          <Label htmlFor="waterStationName">Water station name</Label>
          <Input
            id="waterStationName"
            placeholder="e.g. Crystal Springs Refilling Station"
            disabled={isPending}
            aria-invalid={'waterStationName' in errors}
            {...register('waterStationName')}
          />
          <FieldError message={getError(errors, 'waterStationName')} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="e.g. Juan dela Cruz"
              disabled={isPending}
              aria-invalid={'name' in errors}
              {...register('name')}
            />
            <FieldError message={getError(errors, 'name')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g. 0917 123 4567"
              disabled={isPending}
              aria-invalid={'phoneNumber' in errors}
              {...register('phoneNumber')}
            />
            <FieldError message={getError(errors, 'phoneNumber')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              disabled={isPending}
              aria-invalid={'gender' in errors}
              defaultValue=""
              className={cn(
                'h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
              )}
              {...register('gender')}
            >
              <option value="" disabled>
                Select gender
              </option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </option>
              ))}
            </select>
            <FieldError message={getError(errors, 'gender')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Water station invite code</Label>
            <Input
              id="inviteCode"
              placeholder="Provided by your station owner"
              disabled={isPending}
              aria-invalid={'inviteCode' in errors}
              {...register('inviteCode')}
            />
            <FieldError message={getError(errors, 'inviteCode')} />
          </div>
        </div>
      )}

      {mutation.isError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {mutation.error.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-aqua-mid to-aqua-bright text-cloud hover:opacity-90"
      >
        {isPending ? 'Completing…' : 'Complete registration'}
      </Button>
    </form>
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
        'rounded-xl border p-4 text-left transition-colors',
        selected
          ? 'border-aqua-mid bg-aqua-mist'
          : 'border-input bg-transparent hover:border-aqua-light',
      )}
    >
      <span className="block text-sm font-semibold text-ink">{label}</span>
      <span className="mt-1 block text-xs text-slate">{description}</span>
    </button>
  )
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}

function getError(
  errors: Record<string, { message?: string } | undefined>,
  field: string,
): string | undefined {
  return errors[field]?.message
}
