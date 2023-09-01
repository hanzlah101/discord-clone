import { redirect } from 'next/navigation'
import { redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'
import { ServerSidebar } from '@/components/server/server-sidebar'

const SingleServerLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: { serverId: string }
}) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirectToSignIn()
  }

  const server = await db.server.findFirst({
    where: {
      id: params?.serverId,
      members: { some: { profileId: profile?.id } },
    },
  })

  if (!server) {
    return redirect('/')
  }

  return (
    <div>
      <div className='fixed h-full hidden lg:flex w-60 z-20 flex-col inset-y-0'>
        <ServerSidebar serverId={params?.serverId} />
      </div>
      <main className='h-full lg:pl-60'>{children}</main>
    </div>
  )
}

export default SingleServerLayout
