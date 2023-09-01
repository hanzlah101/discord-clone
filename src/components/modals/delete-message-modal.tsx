'use client'

import * as React from 'react'
import axios from 'axios'
import queryString from 'query-string'

import { toast } from 'sonner'
import { AxiosError } from 'axios'
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

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const { apiUrl, query } = data

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'deleteMessage',
    [isOpen, type]
  )

  const { isLoading, mutate: deleteMessage } = useMutation({
    mutationFn: async () => {
      const url = queryString.stringifyUrl({
        url: apiUrl ?? '',
        query: query,
      })

      await axios.delete(url)
    },

    onSuccess: () => {
      onClose()
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

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background p-0 overflow-hidden'>
        <DialogHeader className='p-6'>
          <DialogTitle className='text-2xl font-bold'>
            Delete Message
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to do this?
            <br />
            This message will be permanently deleted.
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
            onClick={() => deleteMessage()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
