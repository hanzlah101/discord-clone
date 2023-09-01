'use client'

import * as React from 'react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { Check, Copy, RefreshCw } from 'lucide-react'

import { useModal } from '@/hooks/use-modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrigin } from '@/hooks/use-origin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const InviteModal = () => {
  const [copied, setCopied] = React.useState(false)

  const origin = useOrigin()
  const { isOpen, onOpen, onClose, type, data } = useModal()

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'invite',
    [isOpen, type]
  )

  const inviteUrl = React.useMemo(
    () => `${origin}/invite/${data?.server?.inviteCode}`,
    [origin, data]
  )

  const onCopy = React.useCallback(() => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }, [inviteUrl])

  const { isLoading, mutate: generateNewLink } = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(
        `/api/servers/${data?.server?.id}/invite-code`
      )

      onOpen('invite', { server: res?.data })
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
              description: 'Error while regenerating invite, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while regenerating invite, please try again.',
        })
      }
    },
  })

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Invite Friends
          </DialogTitle>
          <DialogDescription>
            Bring your buddies on board and amplify the Discord adventure.
            Let&#39;s connect, chat, and enjoy together!
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label className='uppercase text-xs font-bold text-muted-foreground'>
            Server Invitation Link
          </Label>
          <div className='flex items-center mt-2 gap-x-2'>
            <Input value={inviteUrl} disabled={isLoading} readOnly />
            <Button
              size='icon'
              onClick={onCopy}
              disabled={isLoading}
              className='shrink-0'
            >
              {copied ? (
                <Check className='w-4 h-4' />
              ) : (
                <Copy className='w-4 h-4' />
              )}
            </Button>
          </div>
          <Button
            size={'sm'}
            variant='link'
            disabled={isLoading}
            onClick={() => generateNewLink()}
            className='text-xs text-muted-foreground mt-4 mx-auto'
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Generate a new link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
