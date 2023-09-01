'use client'

import * as React from 'react'
import axios from 'axios'
import Image from 'next/image'
import queryString from 'query-string'

import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { Member, Profile } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react'

import { cn } from '@/libs/utils'
import { useModal } from '@/hooks/use-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { ActionTooltip } from '@/components/action-tooltip'
import { ChatPayload, chatSchema } from '@/libs/validations/chat'
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form'

interface ChatItemProps {
  id: string
  content: string
  timestamp: string
  fileUrl: string | null
  deleted: boolean
  currentMember: Member
  isUpdated: boolean
  socketUrl: string
  socketQuery: Record<string, string>
  member: Member & { profile: Profile }
}

const roleIconMap = {
  Guest: null,
  Moderator: <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
  Admin: <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />,
}

export const ChatItem: React.FC<ChatItemProps> = ({
  id,
  content,
  currentMember,
  timestamp,
  fileUrl,
  deleted,
  isUpdated,
  socketUrl,
  socketQuery,
  member,
}) => {
  const { onOpen } = useModal()
  const [isEditing, setIsEditing] = React.useState(false)

  const router = useRouter()
  const params = useParams()

  const isAdmin = currentMember?.role === 'Admin'
  const isModerator = currentMember?.role === 'Moderator'
  const isOwner = currentMember?.id === member?.id
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && isOwner && !fileUrl

  const fileType = fileUrl?.split('.')?.pop()
  const isPdf = fileUrl && fileType === 'pdf'
  const isImage = fileUrl && !isPdf

  const form = useForm<ChatPayload>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      content,
    },
  })

  React.useEffect(() => {
    form.reset({
      content,
    })
  }, [content, form])

  React.useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsEditing(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const { isLoading, mutate: editMessage } = useMutation({
    mutationFn: async (values: ChatPayload) => {
      const url = queryString.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      })

      await axios.patch(url, values)
    },

    onSuccess: () => {
      form.setValue('content', '')
      setIsEditing(false)
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 422:
            return toast.error('Oh no! Something went wrong.', {
              description: error?.response?.data,
            })
          case 401:
            return toast.error('Unauthorized', {
              description: 'You are not authorized to perform this action.',
            })
          case 400:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Invalid Request, please try again.',
            })
          case 404:
            return toast.error('Oh no! Something went wrong.', {
              description: error?.response?.data,
            })
          case 409:
            return toast.error('Oh no! Something went wrong.', {
              description: "Files can't be edited",
            })
          case 405:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Invalid Request Method.',
            })

          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Unexpected error occured, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Unexpected error occured, please try again.',
        })
      }
    },
  })

  const onSubmit: SubmitHandler<ChatPayload> = async (values) => {
    if (values.content.trim() === '') return
    editMessage(values)
  }

  const onMemberClick = React.useCallback(() => {
    if (member?.id === currentMember?.id) return

    router.push(`/server/${params?.serverId}/conversation/${member?.id}`)
  }, [member, currentMember, router, params])

  return (
    <div className='relative group flex items-center hover:bg-foreground/5 p-4 transition w-full'>
      <div className='group flex gap-x-2 items-start w-full'>
        <div
          onClick={onMemberClick}
          className='cursor-pointer hover:drop-shadow-md transition'
        >
          <UserAvatar src={member?.profile?.image} />
        </div>
        <div className='flex flex-col w-full'>
          <div className='flex items-center gap-x-2'>
            <div className='flex items-center'>
              <p
                onClick={onMemberClick}
                className='font-semibold text-sm dark:text-neutral-300 text-neutral-600 hover:underline cursor-pointer'
              >
                {member?.profile?.name}
              </p>
              <ActionTooltip label={member?.role}>
                {roleIconMap[member?.role]}
              </ActionTooltip>
            </div>
            <span className='text-xs text-muted-foreground'>{timestamp}</span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='relative aspect-square rounded-md border mt-2 overflow-hidden flex items-center bg-foreground/5 h-48 w-48'
            >
              <Image
                fill
                alt={content}
                src={fileUrl}
                className='object-cover'
              />
            </a>
          )}
          {isPdf && (
            <div className='relative flex items-center p-2 rounded-md bg-foreground/5'>
              <FileIcon className='w-10 h-10 fill-indigo-200 stroke-primary' />
              <a
                target='_blank'
                href={fileUrl}
                rel='noopener noreferrer'
                className='ml-2 text-xs font-medium text-primary hover:underline'
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                'text-sm',
                deleted && 'italic text-muted-foreground text-xs mt-1'
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className='text-[10px] mx-2 text-muted-foreground'>
                  (Edited)
                </span>
              )}
            </p>
          )}
          {isEditing && !fileUrl && (
            <Form {...form}>
              <form
                className='flex items-center w-full gap-x-2 pt-2'
                onSubmit={(...args) =>
                  void form.handleSubmit(onSubmit)(...args)
                }
              >
                <FormField
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <div className='relative w-full'>
                          <Input
                            autoFocus
                            id='edit-input'
                            disabled={isLoading}
                            placeholder='Edited Message'
                            className='px-4 bg-foreground/10 h-10'
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button disabled={isLoading} size='sm' className='h-10'>
                  Save
                </Button>
              </form>
              <span className='text-[10px] mt-1 text-muted-foreground'>
                Press escape to cancel and enter to save.
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className='opacity-0 group-hover:opacity-100 flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-secondary border rounded-sm transition-opacity duration-300'>
          {canEditMessage && (
            <ActionTooltip label='Edit'>
              <Edit
                onClick={() => {
                  setIsEditing(!isEditing)
                  document.getElementById('edit-input')?.focus()
                }}
                className='w-4 h-4 cursor-pointer ml-auto text-muted-foreground hover:text-foreground transition-colors'
              />
            </ActionTooltip>
          )}
          <ActionTooltip label='Edit'>
            <Trash2
              onClick={() =>
                onOpen('deleteMessage', {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery,
                })
              }
              className='w-4 h-4 cursor-pointer ml-auto text-muted-foreground hover:text-destructive transition-colors'
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  )
}
