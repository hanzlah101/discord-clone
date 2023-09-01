import { DirectMessage } from '@prisma/client'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'

const MESSAGES_BATCH = 10

export async function GET(req: Request) {
  try {
    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    const cursor = searchParams?.get('cursor')
    const conversationId = searchParams?.get('conversationId')

    if (!conversationId) {
      return new Response('Conversation Id is missing', { status: 400 })
    }

    let messages: DirectMessage[] = []

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: { id: cursor },
        where: { conversationId },
        include: { member: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: { conversationId },
        include: { member: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }

    let nextCursor = null

    if (messages?.length === MESSAGES_BATCH) {
      nextCursor = messages[messages.length - 1]?.id
    }

    const res = {
      items: messages,
      nextCursor,
    }

    return new Response(JSON.stringify(res), { status: 200 })
  } catch (error) {
    return new Response('Error while loading messages, please try again.', {
      status: 500,
    })
  }
}
