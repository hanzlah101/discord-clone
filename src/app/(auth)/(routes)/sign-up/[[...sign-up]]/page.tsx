import Link from 'next/link'

import { OAuthSignIn } from '@/components/oauth-signin'
import { buttonVariants } from '@/components/ui/button'
import { SignUpForm } from '@/components/forms/signup-form'

const SignUpPage = () => {
  return (
    <main className='w-full flex flex-col items-center'>
      <h1 className='text-2xl font-bold'>Welcome to Discord!</h1>
      <p className='text-sm text-muted-foreground mb-4'>
        We&#39;re so excited to see you here!
      </p>

      <SignUpForm />
      <OAuthSignIn />
      <span className='mt-5 text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          href='/sign-in'
          className={buttonVariants({ variant: 'link', size: 'fit' })}
        >
          Sign In
        </Link>
      </span>
    </main>
  )
}

export default SignUpPage
