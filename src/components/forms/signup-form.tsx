'use client'

import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { APIResponseError, parseError } from '@/libs/error'
import { SignUpPayload, signUpSchema } from '@/libs/validations/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export const SignUpForm = () => {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()

  const form = useForm<SignUpPayload>({
    resolver: zodResolver(signUpSchema),
  })

  const { isLoading, mutate: register } = useMutation({
    mutationFn: async (values: SignUpPayload) => {
      if (!isLoaded) return
      form.clearErrors()

      await signUp.create({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        emailAddress: values.email,
        password: values.password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })
    },
    onSuccess: () => {
      router.push('/sign-up/verify-email')
      toast.message('Check your email', {
        description: 'We sent you a 6-digit verification code.',
      })
    },
    onError: (error) => {
      form.setError('root', {
        type: 'manual',
        message: parseError(error as APIResponseError),
      })
    },
  })

  const onSubmit: SubmitHandler<SignUpPayload> = (values) => {
    register(values)
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4 w-full'
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        {form.formState.errors.root && (
          <div className='w-full text-destructive bg-primary/30 text-sm p-3 rounded-md flex items-center justify-between space-x-3'>
            <p className='mx-auto'>{form.formState.errors.root?.message}</p>
            <X
              onClick={() => form.clearErrors('root')}
              className='w-4 h-4 cursor-pointer hover:brightness-110 shrink-0'
            />
          </div>
        )}

        <div className='grid gap-4 sm:grid-cols-2 grid-cols-1'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className='grid gap-4 sm:grid-cols-2 grid-cols-1'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' disabled={isLoading} {...field} />
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
                  <Input type='password' disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button size='lg' type='submit' className='mt-6' isLoading={isLoading}>
          Register
        </Button>
      </form>
    </Form>
  )
}
