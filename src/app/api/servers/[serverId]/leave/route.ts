import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    if (!params?.serverId) {
      return new Response('Server Id is missing', { status: 400 })
    }

    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    await db.server.update({
      where: {
        id: params?.serverId,
        profileId: {
          not: profile?.id,
        },
        members: {
          some: {
            profileId: profile?.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile?.id,
          },
        },
      },
    })

    return new Response('Ok', { status: 200 })
  } catch (error) {
    return new Response('Error while leaving server, please try again.', {
      status: 500,
    })
  }
}
