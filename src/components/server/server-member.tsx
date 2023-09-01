'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { Member, MemberRole, Profile, Server } from '@prisma/client'

import { cn } from '@/libs/utils'
import { UserAvatar } from '@/components/user-avatar'

interface ServerMemberProps {
  server?: Server
  member: Member & { profile: Profile }
}

const roleIconMap = {
  [MemberRole.Guest]: null,
  [MemberRole.Moderator]: <ShieldCheck className='w-4 h-4 text-primary ml-2' />,
  [MemberRole.Admin]: <ShieldAlert className='w-4 h-4 text-rose-500 ml-2' />,
}

export const ServerMember: React.FC<ServerMemberProps> = ({
  server,
  member,
}) => {
  const router = useRouter()
  const params = useParams()

  const icon = roleIconMap[member.role]

  return (
    <button
      onClick={() =>
        router.push(`/server/${params?.serverId}/conversation/${member?.id}`)
      }
      className={cn(
        'group p-2 rounded-md flex items-center gap-x-2 w-full transition-colors mb-1.5',
        params?.memberId === member?.id
          ? 'bg-foreground/10'
          : 'bg-transparent hover:bg-foreground/5'
      )}
    >
      <UserAvatar
        className='w-8 h-8'
        src={member?.profile?.image}
        name={member?.profile?.name}
      />
      <p
        className={cn(
          'font-semibold text-sm transition-colors',
          params?.memberId === member?.id
            ? 'text-foreground'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      >
        {member?.profile?.name}
      </p>
      {icon}
    </button>
  )
}
