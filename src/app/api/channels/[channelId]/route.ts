import { z } from 'zod'
import { MemberRole } from '@prisma/client'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'
import { channelSchema } from '@/libs/validations/channel'

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    const searchParams = new URL(req.url).searchParams
    const serverId = searchParams.get('serverId')

    if (!params?.channelId || !serverId) {
      return new Response('Invalid request', { status: 400 })
    }

    await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile?.id,
            role: {
              in: [MemberRole.Admin, MemberRole.Moderator],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params?.channelId,
            name: {
              not: 'general',
            },
          },
        },
      },
    })

    return new Response('Ok', { status: 200 })
  } catch (error) {
    return new Response('Error while deleting channel, please try again.', {
      status: 500,
    })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    const searchParams = new URL(req.url).searchParams
    const serverId = searchParams.get('serverId')

    if (!params?.channelId || !serverId) {
      return new Response('Invalid request', { status: 400 })
    }

    const body = await req.json()
    const { type, name } = channelSchema.parse(body)

    if (name === 'general') {
      return new Response("Name can't be general", { status: 409 })
    }

    await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile?.id,
            role: {
              in: [MemberRole.Admin, MemberRole.Moderator],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params?.channelId,
              name: { not: 'general' },
            },
            data: { name, type },
          },
        },
      },
    })

    return new Response('Ok', { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.errors[0].message, { status: 422 })
    }

    return new Response('Error while deleting channel, please try again.', {
      status: 500,
    })
  }
}
