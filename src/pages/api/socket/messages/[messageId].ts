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
  if (req.method !== 'DELETE' && req.method !== 'PATCH') {
    res.status(405).json('Method Not Allowed')
  }

  try {
    const profile = await currentProfilePages(req)

    if (!profile) {
      return res.status(401).json('Unauthorized')
    }

    const { serverId, channelId, messageId } = req.query

    if (!serverId || !channelId || !messageId) {
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

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
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

    if (!message || message?.deleted) {
      return res.status(404).json('Message not found')
    }

    const isMessageOwner = message?.memberId === member?.id
    const isAdmin = message?.member?.role === 'Admin'
    const isModerator = message?.member?.role === 'Moderator'
    const canModify = isMessageOwner || isAdmin || isModerator

    if (!canModify) {
      return res.status(401).json('Unauthorized')
    }

    if (req.method === 'DELETE') {
      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          fileUrl: null,
          content: 'This message has been deleted.',
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      })
    }

    if (req.method === 'PATCH') {
      const { content, fileUrl } = chatSchema.parse(req.body)

      if (fileUrl) {
        return res.status(409).json("Files can't be edited")
      }

      if (!isMessageOwner) {
        return res.status(401).json('Unauthorized')
      }

      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      })
    }

    const updateKey = `chat:${channelId}:messages:update`
    res?.socket?.server?.io?.emit(updateKey, message)

    return res.status(200).json('Ok')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.errors[0].message, { status: 422 })
    }

    return new Response('Error while sending message, please try again.', {
      status: 500,
    })
  }
}
