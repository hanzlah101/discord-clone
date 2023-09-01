import * as z from 'zod'
import { ChannelType } from '@prisma/client'

export const channelSchema = z.object({
  name: z
    .string({ required_error: 'Channel name is required' })
    .min(3, { message: 'Name is too short' })
    .max(100, { message: 'Name is too long' })
    .nonempty({ message: 'Name is required' })
    .refine((name) => name !== 'general', {
      message: "Channel name can't be 'general'",
    }),
  type: z.nativeEnum(ChannelType),
})

export type ChannelPayload = z.infer<typeof channelSchema>
