'use client'

import * as React from 'react'
import { IoMdAdd } from 'react-icons/io'
import { Settings } from 'lucide-react'
import { ChannelType, MemberRole } from '@prisma/client'

import { useModal } from '@/hooks/use-modal'
import { ServerWithMemberAndProfile } from '@/types'
import { ActionTooltip } from '@/components/action-tooltip'

interface ServerSectionProps {
  label: string
  role?: MemberRole
  sectionType: 'channels' | 'members'
  channelType?: ChannelType
  server?: ServerWithMemberAndProfile
}

export const ServerSection: React.FC<ServerSectionProps> = ({
  label,
  role,
  sectionType,
  server,
  channelType,
}) => {
  const { onOpen } = useModal()

  return (
    <div className='flex items-center justify-between py-2'>
      <p className='text-muted-foreground text-xs uppercase font-semibold'>
        {label}
      </p>
      {role !== MemberRole.Guest && sectionType === 'channels' && (
        <ActionTooltip label='Create Channel' side='top'>
          <button
            onClick={() => onOpen('createChannel', { channelType })}
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <IoMdAdd className='h-4 w-4' />
          </button>
        </ActionTooltip>
      )}

      {role === MemberRole.Admin && sectionType === 'members' && (
        <ActionTooltip label='Manage Members' side='top'>
          <button
            onClick={() => onOpen('members', { server })}
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <Settings className='h-4 w-4' />
          </button>
        </ActionTooltip>
      )}
    </div>
  )
}
