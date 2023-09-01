'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useSignIn } from '@clerk/nextjs'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ResendCode } from '@/components/resend-code'
import { APIResponseError, parseError } from '@/libs/error'
import { CodePayload, codeSchema } from '@/libs/validations/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface VerifyCodeFormProps {
  onDone: () => void
  onBack: () => void
}

export const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({
  onBack,
  onDone,
}) => {
  const router = useRouter()
  const { isLoaded, signIn } = useSignIn()

  const form = useForm<CodePayload>({
    resolver: zodResolver(codeSchema),
  })

  const { isLoading, mutate: verifyCode } = useMutation({
    mutationFn: async (values: CodePayload) => {
      if (!isLoaded) return
      form.clearErrors()

      if (!signIn.identifier) {
        router.push('/sign-in/reset-password?step=1')
        toast.error("You did't provided an email", {
          description: 'Please provide your email to reset your password',
        })

        throw Error
      }

      await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: values.code,
      })

      if (signIn.firstFactorVerification.status === 'verified') {
        onDone()
        toast.message('Verification successful', {
          description: 'You can now update your password',
        })
      }
    },

    onError: (error) => {
      form.setError('code', {
        type: 'manual',
        message: parseError(error as APIResponseError),
      })
    },
  })

  const onSubmit: SubmitHandler<CodePayload> = (values) => {
    verifyCode(values)
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4 w-full'
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div>
          <h1 className='text-2xl font-bold'>Enter the code</h1>
          <p className='text-sm text-muted-foreground'>
            A 6-digit code was just sent to {signIn?.identifier}
          </p>
        </div>

        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex items-center gap-x-2'>
          <Button
            size='lg'
            variant='secondary'
            onClick={onBack}
            type='button'
            disabled={isLoading}
          >
            Continue
          </Button>

          <Button size='lg' isLoading={isLoading}>
            Continue
          </Button>
        </div>

        <ResendCode
          disabled={isLoaded}
          setError={form.setError}
          variant='Reset Password'
        />
      </form>
    </Form>
  )
}
