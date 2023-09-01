import { redirect } from 'next/navigation'
import { SignedOut, currentUser } from '@clerk/nextjs'

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser()
  if (user) {
    return redirect('/')
  }

  return (
    <SignedOut>
      <main className='h-full min-h-screen flex items-center justify-center bg-[url("/images/bg.svg")] bg-fixed bg-cover bg-no-repeat text-foreground'>
        <div className='max-w-xl w-full mx-3 flex items-center justify-center my-12 py-12 md:px-8 px-4 bg-background rounded-md shadow'>
          {children}
        </div>
      </main>
    </SignedOut>
  )
}

export default AuthLayout
