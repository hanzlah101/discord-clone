'use client'

import * as React from 'react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
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

export const LeaveServerModal = () => {
  const router = useRouter()

  const { isOpen, onClose, type, data } = useModal()
  const server = data?.server

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'leaveServer',
    [isOpen, type]
  )

  const { isLoading, mutate: leaveServer } = useMutation({
    mutationFn: async () => {
      await axios.patch(`/api/servers/${server?.id}/leave`)
    },

    onSuccess: () => {
      onClose()
      router.refresh()
      router.push('/')
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
              description: 'Server Id not found, please try again.',
            })

          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Error while leaving server, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while leaving server, please try again.',
        })
      }
    },
  })

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background p-0 overflow-hidden'>
        <DialogHeader className='p-6'>
          <DialogTitle className='text-2xl font-bold'>Leave Server</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave{' '}
            <span className='text-primary font-semibold'>{server?.name}</span>?
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
            onClick={() => leaveServer()}
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
