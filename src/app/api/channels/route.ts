import { z } from 'zod'
import { MemberRole } from '@prisma/client'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'
import { channelSchema } from '@/libs/validations/channel'

export async function POST(req: Request) {
  try {
    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', {
        status: 401,
      })
    }

    const { searchParams } = new URL(req.url)
    const serverId = searchParams?.get('serverId')

    if (!serverId) {
      return new Response('Server Id is missing', { status: 400 })
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
          create: {
            name,
            type,
            profileId: profile?.id,
          },
        },
      },
    })

    return new Response('Ok', { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.errors[0].message, { status: 422 })
    }

    return new Response('Error while creating channel, please try again.', {
      status: 500,
    })
  }
}
