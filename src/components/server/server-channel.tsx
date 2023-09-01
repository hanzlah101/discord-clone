'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, Hash, Mic, Video, Trash2, Lock } from 'lucide-react'
import { Channel, ChannelType, MemberRole, Server } from '@prisma/client'

import { cn } from '@/libs/utils'
import { useModal } from '@/hooks/use-modal'
import { ActionTooltip } from '@/components/action-tooltip'

interface ServerChannelProps {
  channel: Channel
  server: Server
  role?: MemberRole
}

const iconMap = {
  [ChannelType.Text]: Hash,
  [ChannelType.Audio]: Mic,
  [ChannelType.Video]: Video,
}

export const ServerChannel: React.FC<ServerChannelProps> = ({
  channel,
  server,
  role,
}) => {
  const params = useParams()
  const router = useRouter()
  const { onOpen } = useModal()

  const Icon = iconMap[channel.type]

  return (
    <button
      onClick={() =>
        router.push(`/server/${params?.serverId}/channel/${channel.id}`)
      }
      className={cn(
        'group px-2 py-2.5 rounded-md flex items-center gap-x-2 w-full transition-colors mb-1.5',
        params?.channelId === channel.id
          ? 'bg-foreground/10 text-foreground'
          : 'bg-transparent hover:bg-foreground/5 text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className='flex-shrink-0 w-5 h-5' />
      <p className='line-clamp-1 font-semibold text-xs'>{channel?.name}</p>
      {channel?.name !== 'general' && role !== MemberRole.Guest && (
        <div className='ml-auto flex items-center gap-x-2'>
          <ActionTooltip label='Edit'>
            <Edit
              className='opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground hover:text-foreground transition-all duration-200'
              onClick={(e) => {
                e.stopPropagation()
                onOpen('editChannel', { channel, server })
              }}
            />
          </ActionTooltip>
          <ActionTooltip label='Delete'>
            <Trash2
              onClick={(e) => {
                e.stopPropagation()
                onOpen('deleteChannel', { channel, server })
              }}
              className='opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground hover:text-destructive transition-all duration-200'
            />
          </ActionTooltip>
        </div>
      )}

      {channel?.name === 'general' && (
        <Lock className='ml-auto w-4 h-4 text-muted-foreground' />
      )}
    </button>
  )
}
