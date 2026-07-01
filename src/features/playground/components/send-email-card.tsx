'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  sendEmailSchema,
  type SendEmailFormValues,
} from '../playground.schema'
import { useSendSmoothHandlerEmail } from '../hooks/use-send-smooth-handler-email'

const defaultValues: SendEmailFormValues = {
  email: '',
  name: '',
}

export function SendEmailCard() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const mutation = useSendSmoothHandlerEmail()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendEmailFormValues>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues,
  })

  const onSubmit = handleSubmit((values) => {
    setSuccessMessage(null)
    mutation.mutate(values, {
      onSuccess: () => {
        setSuccessMessage('Email request sent.')
      },
    })
  })

  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trigger the Smooth Handler Supabase Edge Function.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          error={errors.email?.message}
          htmlFor="email"
          label="Email"
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={mutation.isPending}
            placeholder="customer@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field error={errors.name?.message} htmlFor="name" label="Name">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            disabled={mutation.isPending}
            placeholder="Juan Dela Cruz"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        {mutation.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {mutation.error.message}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Sending...' : 'send Email'}
        </Button>
      </form>
    </section>
  )
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode
  error?: string
  htmlFor: string
  label: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
