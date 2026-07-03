import { z } from 'zod'

export const sendEmailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  name: z.string().trim().min(1, 'Name is required.'),
})

export type SendEmailFormValues = z.infer<typeof sendEmailSchema>
