import { Loader2 } from 'lucide-react'
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  return (
    <div className='fixed top-0 left-0 overflow-hidden w-full bg-background z-50 h-full min-h-screen flex items-center justify-center'>
      <AuthenticateWithRedirectCallback
        redirectUrl={'/'}
        afterSignUpUrl={'/'}
        afterSignInUrl={'/'}
        continueSignUpUrl={'/'}
      />
      <Loader2 className='text-primary w-16 h-16 animate-spin' />
    </div>
  )
}
