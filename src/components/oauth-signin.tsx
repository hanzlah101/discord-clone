'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { useSignUp } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'

import type { IconType } from 'react-icons'
import type { OAuthStrategy } from '@clerk/types'

import { Button } from '@/components/ui/button'
import { APIResponseError, parseError } from '@/libs/error'

const oauthProviders = [
  { name: 'Google', strategy: 'oauth_google', icon: FcGoogle },
  { name: 'Github', strategy: 'oauth_github', icon: FaGithub },
] satisfies {
  name: string
  icon: IconType
  strategy: OAuthStrategy
}[]

export const OAuthSignIn = () => {
  const [isLoading, setIsLoading] = React.useState<OAuthStrategy | null>(null)
  const { signUp, isLoaded } = useSignUp()

  const { mutate: oauthSignIn } = useMutation({
    mutationFn: async (provider: OAuthStrategy) => {
      if (!isLoaded) return null
      setIsLoading(provider)

      if (!signUp.username) {
        await signUp.create({
          username: nanoid(10),
        })
      }

      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
        continueSignUp: true,
      })
    },
    onError: (error) => {
      setIsLoading(null)
      toast.error('Oh no! Something went wrong.', {
        description: parseError(error as APIResponseError),
      })
    },
  })

  return (
    <div className='w-full flex flex-col space-y-4'>
      <div className='flex items-center justify-center px-1 pt-6 pb-2'>
        <div className='border-t border-input w-full' />
        <div className='mx-3 text-xs text-muted-foreground'>OR</div>
        <div className='border-t border-input w-full' />
      </div>

      {oauthProviders.map((provider) => {
        const Icon = provider.icon
        return (
          <Button
            size='lg'
            variant='outline'
            key={provider.strategy}
            disabled={isLoading !== null}
            isLoading={isLoading === provider.strategy}
            aria-label={`Sign in with ${provider.name}`}
            onClick={() => void oauthSignIn(provider.strategy)}
          >
            <Icon className='w-4 h-4 mr-2' />
            {provider.name}
          </Button>
        )
      })}
    </div>
  )
}
