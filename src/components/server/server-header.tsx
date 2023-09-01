'use client'

import * as React from 'react'
import { MemberRole } from '@prisma/client'
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'

import { useModal } from '@/hooks/use-modal'
import { ServerWithMemberAndProfile } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ServerHeaderProps {
  server: ServerWithMemberAndProfile
  role?: MemberRole
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({ role, server }) => {
  const { onOpen } = useModal()

  const isAdmin = role === MemberRole.Admin
  const isModerator = isAdmin || role === MemberRole.Moderator

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='focus:outline-none' asChild>
        <button className='w-full text-base font-semibold px-3 flex items-center h-12 border-b hover:bg-foreground/5 transition'>
          {server?.name}
          <ChevronDown className='w-5 h-5 ml-auto' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56 text-xs font-medium text-foreground space-y-0.5'>
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen('invite', { server })}
            className='!text-primary p-3 text-sm cursor-pointer'
          >
            Invite People
            <UserPlus className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            className='p-3 text-sm cursor-pointer'
            onClick={() => onOpen('editServer', { server })}
          >
            Server Settings
            <Settings className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            className='p-3 text-sm cursor-pointer'
            onClick={() => onOpen('members', { server })}
          >
            Manage Members
            <Users className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        )}

        {isModerator && (
          <DropdownMenuItem
            className='p-3 text-sm cursor-pointer'
            onClick={() => onOpen('createChannel', { server })}
          >
            Create Channel
            <PlusCircle className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator />}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen('deleteServer', { server })}
            className='!text-destructive p-3 text-sm cursor-pointer'
          >
            Delete Server
            <Trash2 className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        )}

        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen('leaveServer', { server })}
            className='text-destructive hover:!text-destructive p-3 text-sm cursor-pointer'
          >
            Leave Server
            <LogOut className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
