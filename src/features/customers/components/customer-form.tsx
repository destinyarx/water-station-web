'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { customerFormSchema } from '../customers.schema'
import { CUSTOMER_FORM_DEFAULTS } from '../customers.constants'
import type {
  CustomerFormInput,
  CustomerFormValues,
} from '../customers.types'

interface CustomerFormProps {
  defaultValues?: CustomerFormValues
  onSubmit: (values: CustomerFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
  onCancel?: () => void
}

/**
 * Presentational create/edit customer form. Owns validation and field-level
 * messages only; persistence is passed in via `onSubmit` so the same form backs
 * both the create and edit mutations without embedding Supabase calls.
 */
export function CustomerForm({
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues ?? CUSTOMER_FORM_DEFAULTS,
  })

  const submit = handleSubmit((values) => onSubmit(values))

  const numberSetValueAs = (value: string): number | undefined =>
    value.trim() === '' ? undefined : Number(value)

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="rounded-2xl border border-[#dcecff] bg-[#eef7ff]/50 p-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <StyledInput
            id="name"
            placeholder="e.g. Crystal Springs"
            disabled={isPending}
            aria-invalid={'name' in errors}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#dcecff] bg-white/80 px-4 py-3 text-sm font-semibold text-[#001d34]">
          <input
            type="checkbox"
            className="size-4 rounded border-[#bcd8f2] accent-[#00b4d8]"
            disabled={isPending}
            {...register('isBusiness')}
          />
          This is a business customer
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
          <StyledInput
            id="contactNumber"
            type="tel"
            placeholder="e.g. 0917 123 4567"
            disabled={isPending}
            aria-invalid={'contactNumber' in errors}
            {...register('contactNumber')}
          />
          <FieldError message={errors.contactNumber?.message} />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="facebookUrl">Facebook link</FieldLabel>
          <StyledInput
            id="facebookUrl"
            placeholder="https://facebook.com/..."
            disabled={isPending}
            aria-invalid={'facebookUrl' in errors}
            {...register('facebookUrl')}
          />
          <FieldError message={errors.facebookUrl?.message} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#dcecff] bg-white/70 p-4">
        <p className="mb-4 text-sm font-semibold text-[#001d34]">
          Delivery address
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="streetAddress">Street address</FieldLabel>
            <StyledInput
              id="streetAddress"
              disabled={isPending}
              aria-invalid={'streetAddress' in errors}
              {...register('streetAddress')}
            />
            <FieldError message={errors.streetAddress?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="barangay">Barangay</FieldLabel>
            <StyledInput
              id="barangay"
              disabled={isPending}
              aria-invalid={'barangay' in errors}
              {...register('barangay')}
            />
            <FieldError message={errors.barangay?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="municipality">Municipality</FieldLabel>
            <StyledInput
              id="municipality"
              disabled={isPending}
              aria-invalid={'municipality' in errors}
              {...register('municipality')}
            />
            <FieldError message={errors.municipality?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="province">Province</FieldLabel>
            <StyledInput
              id="province"
              disabled={isPending}
              aria-invalid={'province' in errors}
              {...register('province')}
            />
            <FieldError message={errors.province?.message} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
          <StyledInput
            id="latitude"
            inputMode="decimal"
            placeholder="e.g. 14.5995"
            disabled={isPending}
            aria-invalid={'latitude' in errors}
            {...register('latitude', { setValueAs: numberSetValueAs })}
          />
          <FieldError message={errors.latitude?.message} />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
          <StyledInput
            id="longitude"
            inputMode="decimal"
            placeholder="e.g. 120.9842"
            disabled={isPending}
            aria-invalid={'longitude' in errors}
            {...register('longitude', { setValueAs: numberSetValueAs })}
          />
          <FieldError message={errors.longitude?.message} />
        </div>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#00b4d8] text-white shadow-[0_10px_24px_rgba(0,180,216,0.22)] hover:bg-[#009ec2]"
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: string
  htmlFor: string
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-[#001d34]">
      {children}
    </Label>
  )
}

function StyledInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      className="rounded-xl border-[#dcecff] bg-[#eef7ff]/70 text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
      {...props}
    />
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}
