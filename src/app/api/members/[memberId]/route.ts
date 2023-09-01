import { db } from '@/libs/db'
import { currentProfile } from '@/libs/current-profile'

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    if (!params?.memberId) {
      return new Response('Member Id is missing', { status: 400 })
    }

    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const serverId = searchParams?.get('serverId')

    if (!serverId) {
      return new Response('Server Id is missing', { status: 400 })
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile?.id,
      },
      data: {
        members: {
          deleteMany: {
            id: params?.memberId,
            profileId: { not: profile?.id },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    })

    return new Response(JSON.stringify(server), { status: 200 })
  } catch (error) {
    return new Response('Error while removing member, please try again.', {
      status: 500,
    })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    if (!params?.memberId) {
      return new Response('Member Id is missing', { status: 400 })
    }

    const profile = await currentProfile()

    if (!profile) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { role } = await req.json()

    if (!role) {
      return new Response('Role is missing', { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const serverId = searchParams?.get('serverId')

    if (!serverId) {
      return new Response('Server Id is missing', { status: 400 })
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile?.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params?.memberId,
              profileId: {
                not: profile?.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    })

    return new Response(JSON.stringify(server), { status: 200 })
  } catch (error) {
    return new Response('Error while changing role, please try again.', {
      status: 500,
    })
  }
}
