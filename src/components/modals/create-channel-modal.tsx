'use client'

import * as React from 'react'
import axios from 'axios'
import queryString from 'query-string'

import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { ChannelType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
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

export const CreateChannelModal = () => {
  const router = useRouter()
  const params = useParams()
  const { isOpen, onClose, type, data } = useModal()

  const form = useForm<ChannelPayload>({
    resolver: zodResolver(channelSchema),
  })

  React.useEffect(() => {
    if (data?.channelType) {
      form.setValue('type', data?.channelType)
    } else {
      form.setValue('type', ChannelType.Text)
    }
  }, [form, data])

  const { isLoading, mutate: createChannel } = useMutation({
    mutationFn: async (values: ChannelPayload) => {
      const url = queryString.stringifyUrl({
        url: '/api/channels',
        query: { serverId: params?.serverId },
      })

      await axios.post(url, values)
    },

    onSuccess: () => {
      onClose()
      form.reset()
      form.setValue('name', '')
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
              description: 'Error while creating channel, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while creating channel, please try again.',
        })
      }
    },
  })

  const onSubmit: SubmitHandler<ChannelPayload> = (values) => {
    createChannel(values)
  }

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'createChannel',
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
          <DialogTitle className='text-2xl font-bold'>
            Create Channel
          </DialogTitle>
          <DialogDescription>
            Strengthen community bonds with customizable channels, enabling
            seamless text, voice, and video exchanges among members.
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
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
