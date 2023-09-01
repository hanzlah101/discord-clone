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

    const { conversationId, directMessageId } = req.query

    if (!conversationId || !directMessageId) {
      return res.status(400).json('Invalid Request')
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile?.id,
            },
          },
          {
            memberTwo: {
              profileId: profile?.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    const member =
      conversation?.memberOne?.profileId === profile?.id
        ? conversation?.memberOne
        : conversation?.memberTwo

    if (!member) {
      return res.status(404).json('Member not found')
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!directMessage || directMessage?.deleted) {
      return res.status(404).json('Message not found')
    }

    const isMessageOwner = directMessage?.memberId === member?.id
    const isAdmin = directMessage?.member?.role === 'Admin'
    const isModerator = directMessage?.member?.role === 'Moderator'
    const canModify = isMessageOwner || isAdmin || isModerator

    if (!canModify) {
      return res.status(401).json('Unauthorized')
    }

    if (req.method === 'DELETE') {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
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

      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
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

    const updateKey = `chat:${conversationId}:messages:update`
    res?.socket?.server?.io?.emit(updateKey, directMessage)

    return res.status(200).json('Ok')
  } catch (error) {
    console.log(error)

    if (error instanceof z.ZodError) {
      return new Response(error.errors[0].message, { status: 422 })
    }

    return new Response('Error while sending message, please try again.', {
      status: 500,
    })
  }
}
