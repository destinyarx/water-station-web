import { z } from 'zod'

/**
 * A `notifications` row, limited to display columns. Unknown keys are stripped,
 * so the same schema validates both a `select(...)` result and a realtime
 * `payload.new` (which carries every column).
 */
export const notificationRowSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  is_read: z.boolean(),
  created_at: z.string(),
})

export type NotificationRow = z.infer<typeof notificationRowSchema>
