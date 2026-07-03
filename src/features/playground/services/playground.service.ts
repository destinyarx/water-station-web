import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  type SupabaseClient,
} from '@supabase/supabase-js'

import { sendEmailSchema, type SendEmailFormValues } from '../playground.schema'

const WELCOME_EMAIL_FUNCTION = 'aquaflow-welcome-email'
const EMAIL_SEND_ERROR = 'Failed to send email request.'

export async function sendSmoothHandlerEmail(
  client: SupabaseClient,
  values: SendEmailFormValues,
): Promise<unknown> {
  const input = sendEmailSchema.parse(values)

  const { data, error } = await client.functions.invoke(WELCOME_EMAIL_FUNCTION, {
    body: {
      email: input.email,
      name: input.name,
    },
  })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  return data ?? null
}

async function getFunctionErrorMessage(error: Error): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    return getHttpErrorMessage(error)
  }

  if (error instanceof FunctionsRelayError) {
    return 'Supabase could not relay the email request. Please try again.'
  }

  if (error instanceof FunctionsFetchError) {
    return 'Could not reach the email service. Please check your connection and try again.'
  }

  return error.message || EMAIL_SEND_ERROR
}

async function getHttpErrorMessage(error: FunctionsHttpError): Promise<string> {
  try {
    const body: unknown = await error.context.json()

    if (isRecord(body)) {
      const message = body.error ?? body.message

      if (typeof message === 'string' && message.trim().length > 0) {
        return message
      }
    }
  } catch {
    return EMAIL_SEND_ERROR
  }

  return EMAIL_SEND_ERROR
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
