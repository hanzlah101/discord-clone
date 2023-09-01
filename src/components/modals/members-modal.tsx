'use client'

import * as React from 'react'
import queryString from 'query-string'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { MemberRole } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react'

import { useModal } from '@/hooks/use-modal'
import { ServerWithMemberAndProfile } from '@/types'
import { UserAvatar } from '@/components/user-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const MembersModal = () => {
  const router = useRouter()
  const [loadingId, setLoadingId] = React.useState('')

  const { isOpen, onOpen, onClose, type, data } = useModal()
  const server = data?.server as ServerWithMemberAndProfile

  const roleIconMap = {
    Guest: null,
    Moderator: <ShieldCheck className='w-4 h-4 text-primary' />,
    Admin: <ShieldAlert className='w-4 h-4 text-rose-500' />,
  }

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'members',
    [isOpen, type]
  )

  const { mutate: changeRole } = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string
      role: MemberRole
    }) => {
      setLoadingId(memberId)

      const url = queryString.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      })

      const { data } = await axios.patch(url, { role })
      return data as ServerWithMemberAndProfile
    },

    onSuccess: (data) => {
      router.refresh()
      onOpen('members', { server: data })
      setLoadingId('')
    },

    onError: (error) => {
      setLoadingId('')
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 401:
            return toast.error('Unauthenticated!', {
              description: 'Please login to perform this action.',
            })
          case 400:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Invalid request, please try again.',
            })
          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Error while changing role, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while changing role, please try again.',
        })
      }
    },
  })

  const { mutate: kickMember } = useMutation({
    mutationFn: async (memberId: string) => {
      setLoadingId(memberId)

      const url = queryString.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      })

      const { data } = await axios.delete(url)
      return data as ServerWithMemberAndProfile
    },

    onSuccess: (data) => {
      setLoadingId('')
      router.refresh()
      onOpen('members', { server: data })
    },

    onError: (error) => {
      setLoadingId('')
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 401:
            return toast.error('Unauthenticated!', {
              description: 'Please login to perform this action.',
            })
          case 400:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Invalid request, please try again.',
            })
          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Error while kicking me mber, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while kicking member, please try again.',
        })
      }
    },
  })

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Manage Members
          </DialogTitle>
          <DialogDescription>
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='mt-8 max-h-[420px]'>
          {server?.members?.map((member) => (
            <div key={member?.id} className='flex items-center gap-x-2 mb-6'>
              <UserAvatar
                src={member?.profile?.image}
                name={member?.profile?.name ?? ''}
              />
              <div className='flex flex-col gap-y-1'>
                <div className='text-xs font-semibold flex items-center gap-x-1'>
                  {member?.profile?.name}
                  {roleIconMap[member?.role]}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {member?.profile?.email}
                </p>
              </div>
              {server?.profileId !== member?.profileId &&
                loadingId !== member?.id && (
                  <div className='ml-auto'>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className='w-5 h-5 text-muted-foreground' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side='left'>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className='flex items-center'>
                            <ShieldQuestion className='w-4 h-4 mr-2' />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className='w-40'>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRole({
                                    memberId: member?.id,
                                    role: 'Guest',
                                  })
                                }
                              >
                                <Shield className='w-4 h-4 mr-2' />
                                Guest
                                {member?.role === 'Guest' && (
                                  <Check className='w-4 h-4 ml-auto' />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRole({
                                    memberId: member?.id,
                                    role: 'Moderator',
                                  })
                                }
                              >
                                <ShieldCheck className='w-4 h-4 mr-2' />
                                Moderator
                                {member?.role === 'Moderator' && (
                                  <Check className='w-4 h-4 ml-auto' />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='!text-destructive'
                          onClick={() => kickMember(member?.id)}
                        >
                          <Gavel className='w-4 h-4 mr-2' />
                          Kick
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              {loadingId === member?.id && (
                <Loader2 className='w-4 h-4 text-muted-foreground ml-auto animate-spin' />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
