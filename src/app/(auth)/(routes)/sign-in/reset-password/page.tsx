'use client'

import * as React from 'react'
import queryString from 'query-string'
import { useRouter, useSearchParams } from 'next/navigation'

import { VerifyCodeForm } from '@/components/forms/verify-code-form'
import { ResetEmailForm } from '@/components/forms/reset-email-form'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'

const ResetPasswordPage = () => {
  const router = useRouter()
  const params = useSearchParams()

  const paramsObj = queryString.parse(params!?.toString()) as { step: string }
  const currentStep = parseInt(paramsObj.step, 10) || 1

  const goToNextStep = React.useCallback(() => {
    let updatedStep

    if (currentStep > 3) updatedStep = 2
    else if (currentStep < 1) updatedStep = 1
    else updatedStep = currentStep + 1

    const url = queryString.stringifyUrl(
      { url: '/sign-in/reset-password', query: { step: updatedStep } },
      { skipNull: true }
    )

    router.push(url)
  }, [router, currentStep])

  const goBack = React.useCallback(() => {
    if (currentStep === 1) return null

    const updatedStep = currentStep - 1
    const url = queryString.stringifyUrl(
      { url: '/sign-in/reset-password', query: { step: updatedStep } },
      { skipNull: true }
    )

    router.push(url)
  }, [router, currentStep])

  return (
    <main className='w-full'>
      {(() => {
        switch (currentStep) {
          case 1:
            return <ResetEmailForm onDone={goToNextStep} />
          case 2:
            return <VerifyCodeForm onDone={goToNextStep} onBack={goBack} />
          case 3:
            return <ResetPasswordForm />
          default:
            return <ResetEmailForm onDone={goToNextStep} />
        }
      })()}
    </main>
  )
}

export default ResetPasswordPage
