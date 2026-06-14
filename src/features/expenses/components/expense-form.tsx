'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  EXPENSE_FORM_DEFAULTS,
  expenseCategories,
  paymentMethods,
} from '../expenses.constants'
import { expenseFormSchema } from '../expenses.schema'
import type {
  ExpenseFormInput,
  ExpenseFormValues,
} from '../expenses.types'

interface ExpenseFormProps {
  defaultValues?: ExpenseFormValues
  onSubmit: (values: ExpenseFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
  onCancel?: () => void
}

export function ExpenseForm({
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
  onCancel,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaultValues ?? EXPENSE_FORM_DEFAULTS,
  })

  const selectedCategory = watch('category')
  const selectedPaymentMethod = watch('paymentMethod')
  const submit = handleSubmit((values) => onSubmit(values))

  const numberSetValueAs = (value: string): number | undefined =>
    value.trim() === '' ? undefined : Number(value)

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="rounded-2xl border border-[#dcecff] bg-[#eef7ff]/50 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="name">Expense name</FieldLabel>
            <StyledInput
              id="name"
              placeholder="e.g. Membrane replacement"
              disabled={isPending}
              aria-invalid={'name' in errors}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="amount">Amount</FieldLabel>
            <StyledInput
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              disabled={isPending}
              aria-invalid={'amount' in errors}
              {...register('amount', { setValueAs: numberSetValueAs })}
            />
            <FieldError message={errors.amount?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="dateIncurred">Expense date</FieldLabel>
            <StyledInput
              id="dateIncurred"
              type="date"
              disabled={isPending}
              aria-invalid={'dateIncurred' in errors}
              {...register('dateIncurred')}
            />
            <FieldError message={errors.dateIncurred?.message} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <StyledSelect
            id="category"
            disabled={isPending}
            aria-invalid={'category' in errors}
            {...register('category')}
          >
            {expenseCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.name}
              </option>
            ))}
          </StyledSelect>
          <FieldError message={errors.category?.message} />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="paymentMethod">Payment method</FieldLabel>
          <StyledSelect
            id="paymentMethod"
            disabled={isPending}
            aria-invalid={'paymentMethod' in errors}
            {...register('paymentMethod')}
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.name}
              </option>
            ))}
          </StyledSelect>
          <FieldError message={errors.paymentMethod?.message} />
        </div>

        {selectedCategory === 'other' ? (
          <div className="space-y-2">
            <FieldLabel htmlFor="categoryOther">Category details</FieldLabel>
            <StyledInput
              id="categoryOther"
              disabled={isPending}
              aria-invalid={'categoryOther' in errors}
              {...register('categoryOther')}
            />
            <FieldError message={errors.categoryOther?.message} />
          </div>
        ) : null}

        {selectedPaymentMethod === 'other' ? (
          <div className="space-y-2">
            <FieldLabel htmlFor="paymentMethodOther">
              Payment method details
            </FieldLabel>
            <StyledInput
              id="paymentMethodOther"
              disabled={isPending}
              aria-invalid={'paymentMethodOther' in errors}
              {...register('paymentMethodOther')}
            />
            <FieldError message={errors.paymentMethodOther?.message} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <StyledInput
            id="description"
            placeholder="Optional notes"
            disabled={isPending}
            aria-invalid={'description' in errors}
            {...register('description')}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <FieldLabel htmlFor="referencesNumber">Reference number</FieldLabel>
          <StyledInput
            id="referencesNumber"
            placeholder="Optional receipt, transfer, or payment reference"
            disabled={isPending}
            aria-invalid={'referencesNumber' in errors}
            {...register('referencesNumber')}
          />
          <FieldError message={errors.referencesNumber?.message} />
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

function StyledSelect(props: ComponentProps<'select'>) {
  return (
    <select
      className="h-9 w-full rounded-xl border border-[#dcecff] bg-[#eef7ff]/70 px-3 text-sm text-[#001d34] shadow-xs outline-none transition-[color,box-shadow] focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}
