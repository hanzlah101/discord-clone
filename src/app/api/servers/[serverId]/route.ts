import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'
import { serverSchema } from '@/libs/validations/server'

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

    const body = await req.json()
    const { image, name } = serverSchema.parse(body)

    await db.server.update({
      where: {
        id: params?.serverId,
        profileId: profile?.id,
      },
      data: {
        name,
        image,
      },
    })

    return new Response('Ok', { status: 200 })
  } catch (error) {
    return new Response('Error while updating server info, please try again.', {
      status: 500,
    })
  }
}

export async function DELETE(
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

    await db.server.delete({
      where: {
        id: params?.serverId,
        profileId: profile?.id,
      },
    })

    return new Response('Ok', { status: 200 })
  } catch (error) {
    return new Response('Error while deleting server, please try again.', {
      status: 500,
    })
  }
}
