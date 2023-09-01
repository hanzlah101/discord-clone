'use client'

import * as React from 'react'
import axios from 'axios'
import queryString from 'query-string'

import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

import { useModal } from '@/hooks/use-modal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const DeleteChannelModal = () => {
  const router = useRouter()

  const { isOpen, onClose, type, data } = useModal()
  const { channel, server } = data

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'deleteChannel',
    [isOpen, type]
  )

  const { isLoading, mutate: deleteChannel } = useMutation({
    mutationFn: async () => {
      const url = queryString.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: { serverId: server?.id },
      })

      await axios.delete(url)
    },

    onSuccess: () => {
      onClose()
      router.refresh()
      router.push(`/server/${server?.id}`)
    },

    onError: (error) => {
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
              description: 'Error while deleting channel, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while deleting channel, please try again.',
        })
      }
    },
  })

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background p-0 overflow-hidden'>
        <DialogHeader className='p-6'>
          <DialogTitle className='text-2xl font-bold'>
            Delete Channel
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to do this?
            <br />
            <span className='text-primary font-semibold'>
              #{channel?.name}
            </span>{' '}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex items-center justify-end w-full bg-secondary px-6 py-4 space-x-3'>
          <Button
            variant='ghost'
            disabled={isLoading}
            onClick={() => onClose()}
            className='hover:bg-foreground/5'
          >
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            variant={'destructive'}
            className='min-w-[85px]'
            onClick={() => deleteChannel()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
