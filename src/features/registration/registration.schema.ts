import { z } from 'zod'
import { GENDERS } from './registration.constants'

const ownerSchema = z.object({
  isOwner: z.literal(true),
  waterStationName: z
    .string()
    .trim()
    .min(1, 'Water station name is required.'),
})

const staffSchema = z.object({
  isOwner: z.literal(false),
  name: z.string().trim().min(1, 'Name is required.'),
  phoneNumber: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .max(20, 'Enter a valid phone number.'),
  gender: z.enum(GENDERS, { message: 'Select a gender.' }),
  inviteCode: z
    .string()
    .trim()
    .min(1, 'Water station invite code is required.'),
})

export const registrationSchema = z.discriminatedUnion('isOwner', [
  ownerSchema,
  staffSchema,
])
