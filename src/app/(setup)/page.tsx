import { redirect } from 'next/navigation'

import { db } from '@/libs/db'
import { initialProfile } from '@/libs/initial-profile'
import { InitialModal } from '@/components/modals/initial-modal'

const SetupPgae = async () => {
  const profile = await initialProfile()

  const server = await db.server.findFirst({
    where: {
      members: {
        some: { profileId: profile?.id },
      },
    },
  })

  if (server) return redirect(`/server/${server.id}`)

  return <InitialModal />
}

export default SetupPgae
