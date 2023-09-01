import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'

interface InvieCodePageProps {
  params: {
    inviteCode: string
  }
}

const InvieCodePage = async ({ params }: InvieCodePageProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirectToSignIn()
  }

  if (!params?.inviteCode) {
    return redirect('/')
  }

  const existingServer = await db.server.findFirst({
    where: {
      AND: [
        { inviteCode: params?.inviteCode },
        {
          members: {
            some: { id: profile?.id },
          },
        },
      ],
    },
  })

  if (existingServer) {
    return redirect(`/server/${existingServer?.id}`)
  }

  const server = await db.server.update({
    where: {
      inviteCode: params?.inviteCode,
    },
    data: {
      members: {
        create: {
          profileId: profile?.id,
        },
      },
    },
  })

  if (server) {
    return redirect(`/server/${server?.id}`)
  }

  return (
    <div className='flex items-center justify-center'>
      <Loader2 className='text-primary w-16 h-16 animate-spin' />
    </div>
  )
}

export default InvieCodePage
