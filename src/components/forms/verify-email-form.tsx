'use client'

import { toast } from 'sonner'
import { useSignUp } from '@clerk/nextjs'
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

export const VerifyEmailForm = () => {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()

  const form = useForm<CodePayload>({
    resolver: zodResolver(codeSchema),
  })

  const { isLoading, mutate: verify } = useMutation({
    mutationFn: async (values: CodePayload) => {
      if (!isLoaded) return
      form.clearErrors()

      if (!signUp.emailAddress) {
        router.push('/sign-up')
        toast.error("You don't have an account yet", {
          description: 'Please create an account to proceed',
        })

        throw Error
      }

      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: values.code,
      })

      if (
        signUpAttempt.status === 'complete' &&
        signUpAttempt.verifications.emailAddress.status === 'verified'
      ) {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.push(`${window.location.origin}/`)
        toast.success('Success!', {
          description: 'Email verified successfully',
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
    verify(values)
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
            A 6-digit code was just sent to {signUp?.emailAddress}
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

        <Button size='lg' isLoading={isLoading}>
          Verify
        </Button>

        <ResendCode
          disabled={isLoaded}
          setError={form.setError}
          variant='Verify Account'
        />
      </form>
    </Form>
  )
}
