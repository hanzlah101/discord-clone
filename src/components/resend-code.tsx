'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import type { UseFormSetError } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { CodePayload } from '@/libs/validations/auth'
import { APIResponseError, parseError } from '@/libs/error'

interface ResendCodeProps {
  disabled?: boolean
  setError: UseFormSetError<CodePayload>
  variant: 'Verify Account' | 'Reset Password'
}

export const ResendCode: React.FC<ResendCodeProps> = ({
  variant,
  disabled,
  setError,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(60)
  const [isResendAllowed, setIsResendAllowed] = React.useState(false)

  const router = useRouter()
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp()
  const { signIn, isLoaded: isSignInLoaded } = useSignIn()

  React.useEffect(() => {
    const initialTimeLeft = sessionStorage?.getItem('timeLeft') ?? 60
    setTimeLeft(Number(initialTimeLeft))
  }, [])

  React.useEffect(() => {
    let timer: any

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
        sessionStorage?.setItem('timeLeft', (timeLeft - 1).toString())
      }, 1000)
    } else {
      setIsResendAllowed(true)
      clearInterval(timer)
    }

    return () => clearInterval(timer)
  }, [timeLeft])

  const { mutate: resendCode, isLoading } = useMutation({
    mutationFn: async () => {
      if (variant === 'Verify Account') {
        if (!isSignUpLoaded) return null

        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        })

        return toast.success('Check your email', {
          description: 'We have sent you a 6-digit verification code',
        })
      } else if (variant === 'Reset Password') {
        if (!isSignInLoaded) return null

        if (!signIn.identifier) {
          toast.error('Uh oh! Something went wrong.', {
            description: 'No email found or session expired, please try again.',
          })

          return router.push('/')
        }

        const firstFactor = await signIn.create({
          strategy: 'reset_password_email_code',
          identifier: signIn.identifier,
        })

        if (firstFactor.status === 'needs_first_factor') {
          return toast.message('Check your email', {
            description: 'We sent you a 6-digit verification code.',
          })
        }
      }
    },

    onSuccess: () => {
      setTimeLeft(60)
      setIsResendAllowed(false)
      sessionStorage.setItem('timeLeft', '60')
    },

    onError: (error) => {
      setError('code', {
        type: 'manual',
        message: parseError(error as APIResponseError),
      })
    },
  })

  return (
    <div className='w-full mx-auto grid self-center pt-2'>
      {isResendAllowed ? (
        <Button
          size='fit'
          type='button'
          variant={'link'}
          className='mx-auto'
          disabled={disabled || isLoading}
          onClick={() => resendCode()}
        >
          Resend Code
        </Button>
      ) : (
        <p className='text-center mx-auto text-xs'>
          Resend OTP in {timeLeft} seconds
        </p>
      )}
    </div>
  )
}
