import * as z from 'zod'

export const signInSchema = z.object({
  emailOrUsername: z.union([
    z
      .string({ required_error: 'Username or Email Address is required' })
      .email({ message: 'Invalid username or email address' })
      .nonempty(),
    z
      .string({ required_error: 'Username or Email Address is required' })
      .min(4, { message: 'Must be at least 4 characters' })
      .max(64, { message: 'Must be at most 64 characters' })
      .regex(/^[0-9a-zA-Z_\-]+$/, {
        message: 'Invalid username or email address',
      })
      .nonempty(),
  ]),
  password: z
    .string({ required_error: 'Please enter a password' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be at most 100 characters' })
    .nonempty(),
})

export type SignInPayload = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    firstName: z
      .string({ required_error: 'Please enter your first name' })
      .min(3, { message: 'Name must be at least 3 characters' })
      .max(100, { message: 'Name must be at most 100 characters' })
      .nonempty({ message: 'Please enter your first name' }),
    lastName: z
      .string({ required_error: 'Please enter your last name' })
      .min(3, { message: 'Name must be at least 3 characters' })
      .max(100, { message: 'Name must be at most 100 characters' })
      .nonempty({ message: 'Please enter your last name' }),
    username: z
      .string({ required_error: 'Please enter a username' })
      .min(4, { message: 'Username must be at least 4 characters' })
      .max(64, { message: 'Username must be at most 64 characters' })
      .regex(/^[0-9a-zA-Z_\-]+$/, { message: 'Invalid username' })
      .nonempty({ message: 'Please enter a username' }),
    email: z
      .string({ required_error: 'Please enter your email address' })
      .email({ message: 'Invalid Email Address' })
      .nonempty({ message: 'Please enter your email address' }),
    password: signInSchema.shape.password,
    confirm: z
      .string({ required_error: 'Please confirm your password' })
      .min(8, { message: "Passwords don't match" })
      .nonempty({ message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  })

export type SignUpPayload = z.infer<typeof signUpSchema>

export const codeSchema = z.object({
  code: z
    .string({ required_error: 'Please enter the verification code' })
    .min(6, { message: 'Incorrect code' })
    .max(6, { message: 'Incorrect code' })
    .nonempty({ message: 'Please enter the verification code' }),
})

export type CodePayload = z.infer<typeof codeSchema>

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Please enter your email address' })
    .email({ message: 'Invalid Email Address' })
    .nonempty({ message: 'Please enter your email address' }),
})

export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>

export const passwordSchema = z
  .object({
    password: signInSchema.shape.password,
    confirm: z
      .string({ required_error: 'Please confirm your password' })
      .min(8, { message: "Passwords don't match" })
      .nonempty(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  })

export type PasswordPayload = z.infer<typeof passwordSchema>
