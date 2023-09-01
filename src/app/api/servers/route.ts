import { z } from 'zod'
import { nanoid } from 'nanoid'

import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'
import { serverSchema } from '@/libs/validations/server'

export async function POST(req: Request) {
  try {
    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', {
        status: 401,
      })
    }

    const body = await req.json()
    const { image, name } = serverSchema.parse(body)

    await db.server.create({
      data: {
        name,
        image,
        inviteCode: nanoid(),
        profileId: profile?.id,
        channels: { create: [{ name: 'general', profileId: profile?.id }] },
        members: { create: [{ profileId: profile?.id, role: 'Admin' }] },
      },
    })

    return new Response('Ok', { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.errors[0].message, { status: 422 })
    }

    return new Response('Error while creating server, please try again.', {
      status: 500,
    })
  }
}
