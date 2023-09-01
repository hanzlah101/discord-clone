import { nanoid } from 'nanoid'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (!params?.serverId) {
      return new Response('Server Id is missing', { status: 400 })
    }

    const server = await db.server.update({
      where: {
        id: params?.serverId,
        profileId: profile?.id,
      },
      data: {
        inviteCode: nanoid(),
      },
    })

    return new Response(JSON.stringify(server), { status: 200 })
  } catch (error) {
    return new Response('Error while regenerating invite, please try again.', {
      status: 500,
    })
  }
}
