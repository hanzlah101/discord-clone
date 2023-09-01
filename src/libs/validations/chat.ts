import * as z from 'zod'

export const chatSchema = z.object({
  content: z.string().min(1).nonempty(),
  fileUrl: z.string().optional(),
})

export type ChatPayload = z.infer<typeof chatSchema>
