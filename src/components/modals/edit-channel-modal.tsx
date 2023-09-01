'use client'

import * as React from 'react'
import axios from 'axios'
import queryString from 'query-string'

import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { ChannelType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { useModal } from '@/hooks/use-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChannelPayload, channelSchema } from '@/libs/validations/channel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const EditChannelModal = () => {
  const router = useRouter()
  const { isOpen, onClose, type, data } = useModal()
  const { channel, server } = data

  const form = useForm<ChannelPayload>({
    resolver: zodResolver(channelSchema),
  })

  React.useEffect(() => {
    if (channel) {
      form.setValue('name', channel?.name)
      form.setValue('type', channel?.type)
    }
  }, [form, channel])

  const { isLoading, mutate: updateChannel } = useMutation({
    mutationFn: async (values: ChannelPayload) => {
      const url = queryString.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: { serverId: server?.id },
      })

      await axios.patch(url, values)
    },

    onSuccess: () => {
      form.setValue('name', '')
      onClose()
      form.reset()
      router.refresh()
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 422:
            return toast.error('Oh no! Something went wrong.', {
              description: error?.response?.data,
            })
          case 401:
            return toast.error('Unauthenticated', {
              description: 'Please login to perform this action.',
            })
          case 400:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Server Id is missing, please try again.',
            })
          case 409:
            return form.setError('name', {
              type: 'manual',
              message: "Channel name can't be 'general'",
            })

          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Error while updating channel, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while updating channel, please try again.',
        })
      }
    },
  })

  const onSubmit: SubmitHandler<ChannelPayload> = (values) => {
    updateChannel(values)
  }

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'editChannel',
    [isOpen, type]
  )

  const handleClose = React.useCallback(() => {
    form.reset()
    onClose()
  }, [onClose, form])

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='bg-background p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl font-bold'>Edit Channel</DialogTitle>
          <DialogDescription>
            Customize your channels anytime you want.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='px-3'>
                  <FormLabel>Channel name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='px-3'>
                  <FormLabel>Channel Type</FormLabel>
                  <Select
                    disabled={isLoading}
                    defaultValue={field?.value}
                    onValueChange={field?.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a channel type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ChannelType).map((type) => (
                        <SelectItem value={type} key={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='bg-secondary py-4 px-3'>
              <Button
                type='submit'
                isLoading={isLoading}
                className='min-w-[100px]'
              >
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
