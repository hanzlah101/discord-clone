import * as z from 'zod'

export const serverSchema = z.object({
  name: z
    .string({ required_error: 'Server name is required' })
    .min(3, { message: 'Name is too short' })
    .max(100, { message: 'Name is too long' })
    .nonempty({ message: 'Name is required' }),
  image: z
    .string({ required_error: 'Server image is required' })
    .nonempty({ message: 'Image is required' }),
})

export type ServerPayload = z.infer<typeof serverSchema>
