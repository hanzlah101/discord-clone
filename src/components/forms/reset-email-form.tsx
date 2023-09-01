'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useSignIn } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { APIResponseError, parseError } from '@/libs/error'
import {
  ResetPasswordPayload,
  resetPasswordSchema,
} from '@/libs/validations/auth'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface ResetEmailFormProps {
  onDone: () => void
}

export const ResetEmailForm: React.FC<ResetEmailFormProps> = ({ onDone }) => {
  const { isLoaded, signIn } = useSignIn()

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const { isLoading, mutate: verifyEmail } = useMutation({
    mutationFn: async (values: ResetPasswordPayload) => {
      if (!isLoaded) return
      form.clearErrors()

      const firstFactor = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: values.email,
      })

      if (firstFactor.status === 'needs_first_factor') {
        onDone()
        toast.message('Check your email', {
          description: 'We sent you a 6-digit verification code.',
        })
      }
    },

    onError: (error) => {
      form.setError('email', {
        type: 'manual',
        message: parseError(error as APIResponseError),
      })
    },
  })

  const onSubmit: SubmitHandler<ResetPasswordPayload> = (values) => {
    verifyEmail(values)
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4 w-full'
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div>
          <h1 className='text-2xl font-bold'>Enter your email</h1>
          <p className='text-sm text-muted-foreground'>
            Enter the email associated with your account to reset your password.
          </p>
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size='lg' isLoading={isLoading}>
          Continue
        </Button>
      </form>
    </Form>
  )
}
