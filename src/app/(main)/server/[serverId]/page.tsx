import { redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'
import { redirect } from 'next/navigation'

interface SingleServerPageProps {
  params: { serverId: string }
}

const SingleServerPage = async ({
  params: { serverId },
}: SingleServerPageProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirectToSignIn()
  }

  const server = await db.server.findFirst({
    where: {
      AND: [
        { id: serverId },
        { members: { some: { profileId: profile?.id } } },
      ],
    },
    include: {
      channels: {
        where: {
          name: 'general',
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!server) {
    return redirect('/')
  }

  const initialChannel = server?.channels[0]

  if (initialChannel?.name !== 'general') {
    return null
  }

  return redirect(`/server/${serverId}/channel/${initialChannel?.id}`)
}

export default SingleServerPage
