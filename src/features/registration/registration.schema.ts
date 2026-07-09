import { z } from 'zod'

const ownerSchema = z.object({
  isOwner: z.literal(true),
  organizationName: z
    .string()
    .trim()
    .min(1, 'Water station name is required.'),
})

const staffSchema = z.object({
  isOwner: z.literal(false),
  organizationCode: z
    .string()
    .trim()
    .min(1, 'Water station code is required.'),
  contactNumber: z
    .string()
    .trim()
    .min(7, 'Enter a valid contact number.')
    .max(20, 'Enter a valid contact number.'),
})

export const registrationSchema = z.discriminatedUnion('isOwner', [
  ownerSchema,
  staffSchema,
])
