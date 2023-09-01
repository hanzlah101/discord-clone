import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { OAuthSignIn } from '@/components/oauth-signin'
import { SignInForm } from '@/components/forms/signin-form'

const SignInPage = () => {
  return (
    <main className='w-full flex flex-col items-center'>
      <h1 className='text-2xl font-bold'>Welcome Back!</h1>
      <p className='text-sm text-muted-foreground mb-4'>
        We&#39;re so excited to see you again!
      </p>

      <SignInForm />
      <OAuthSignIn />
      <span className='mt-5 text-sm text-muted-foreground'>
        Need an account?{' '}
        <Link
          href='/sign-up'
          className={buttonVariants({ variant: 'link', size: 'fit' })}
        >
          Register
        </Link>
      </span>
    </main>
  )
}

export default SignInPage
