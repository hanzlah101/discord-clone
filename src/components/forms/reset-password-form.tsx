'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { APIResponseError, parseError } from '@/libs/error'
import { PasswordPayload, passwordSchema } from '@/libs/validations/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export const ResetPasswordForm = () => {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const form = useForm<PasswordPayload>({
    resolver: zodResolver(passwordSchema),
  })

  const { isLoading, mutate: resetPassword } = useMutation({
    mutationFn: async (values: PasswordPayload) => {
      if (!isLoaded) return null
      form.clearErrors()

      if (!signIn?.identifier) {
        router.push('/sign-in/reset-password?step=1')
        toast.error("You did't provided an email", {
          description: 'Please provide your email to reset your password',
        })

        throw Error
      }

      const attemptedFirstFactor = await signIn?.resetPassword({
        password: values.password,
      })

      if (attemptedFirstFactor.status === 'complete') {
        toast.success('Congratulations!', {
          description: "You've successfully changed your password",
        })

        setActive({ session: attemptedFirstFactor.createdSessionId })
        return router.push('/')
      }
    },

    onError: (error) => {
      form.setError('password', {
        type: 'manual',
        message: parseError(error as APIResponseError),
      })
    },
  })

  const onSubmit: SubmitHandler<PasswordPayload> = (values) => {
    resetPassword(values)
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4 w-full'
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div>
          <h1 className='text-2xl font-bold'>Create New Password</h1>
          <p className='text-sm text-muted-foreground'>
            Enter a new strong password for your account
          </p>
        </div>

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input disabled={isLoading} type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirm'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input disabled={isLoading} type='password' {...field} />
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
