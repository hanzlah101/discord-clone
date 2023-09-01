import { NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import { Server as NewServer, Socket } from 'net'
import { Member, Message, Profile, Server } from '@prisma/client'

export type ServerWithMemberAndProfile = Server & {
  members: (Member & { profile: Profile })[]
}

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NewServer & {
      io: IOServer
    }
  }
}

export type MessageWithMemberAndProfile = Message & {
  member: Member & {
    profile: Profile
  }
}
