import { z } from 'zod'
import { NextApiRequest } from 'next'

import { db } from '@/libs/db'
import { NextApiResponseServerIo } from '@/types'
import { chatSchema } from '@/libs/validations/chat'
import { currentProfilePages } from '@/libs/current-profile-pages'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== 'POST') {
    res.status(405).json('Method Not Allowed')
  }

  try {
    const profile = await currentProfilePages(req)

    if (!profile) {
      return res.status(401).json('Unauthorized')
    }

    const { content, fileUrl } = chatSchema.parse(req.body)

    const { serverId, channelId } = req.query

    if (!serverId || !channelId) {
      return res.status(400).json('Invalid Request')
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile?.id,
          },
        },
      },
      include: {
        members: true,
      },
    })

    if (!server) {
      return res.status(404).json('Server not found')
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    })

    if (!channel) {
      return res.status(404).json('Channel not found')
    }

    const member = server.members.find(
      (member) => member.profileId === profile?.id
    )

    if (!member) {
      return res.status(404).json('Member not found')
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        memberId: member?.id,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    })

    const chanelKey = `chat:${channelId}:messages`

    res?.socket?.server?.io?.emit(chanelKey, message)

    return res.status(200).json(message)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.errors[0].message, { status: 422 })
    }

    return new Response('Error while sending message, please try again.', {
      status: 500,
    })
  }
}
