'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useSignIn } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { APIResponseError, parseError } from '@/libs/error'
import { Button, buttonVariants } from '@/components/ui/button'
import { SignInPayload, signInSchema } from '@/libs/validations/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export const SignInForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn()

  const form = useForm<SignInPayload>({
    resolver: zodResolver(signInSchema),
  })

  const { isLoading, mutate: logIn } = useMutation({
    mutationFn: async (values: SignInPayload) => {
      if (!isLoaded) return
      form.clearErrors()

      const result = await signIn.create({
        identifier: values.emailOrUsername,
        password: values.password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Success!', { description: 'Logged in successfully' })
      }
    },
    onError: (error) => {
      form.setValue('password', '')
      form.setError('root', {
        type: 'manual',
        message: parseError(error as APIResponseError),
      })
    },
  })

  const onSubmit: SubmitHandler<SignInPayload> = (values) => {
    logIn(values)
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

        <FormField
          control={form.control}
          name='emailOrUsername'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Username</FormLabel>
              <FormControl>
                <Input disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' disabled={isLoading} {...field} />
              </FormControl>
              <div className='flex items-center justify-between gap-x-3'>
                <FormMessage />
                <Link
                  href={'/sign-in/reset-password/?step=1'}
                  className={buttonVariants({
                    variant: 'link',
                    size: 'fit',
                    className: 'text-xs ml-auto',
                  })}
                >
                  Forgot your password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        <Button size='lg' type='submit' className='mt-6' isLoading={isLoading}>
          Log In
        </Button>
      </form>
    </Form>
  )
}
