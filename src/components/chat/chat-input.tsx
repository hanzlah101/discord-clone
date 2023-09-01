'use client'

import * as React from 'react'
import queryString from 'query-string'
import axios from 'axios'

import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { IoMdAdd } from 'react-icons/io'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { useModal } from '@/hooks/use-modal'
import { Input } from '@/components/ui/input'
import { EmojiPicker } from '@/components/emoji-picker'
import { ChatPayload, chatSchema } from '@/libs/validations/chat'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'

interface ChatInputProps {
  apiUrl: string
  query: Record<string, any>
  name: string
  type: 'conversation' | 'channel'
}

export const ChatInput: React.FC<ChatInputProps> = ({
  apiUrl,
  query,
  name,
  type,
}) => {
  const { onOpen } = useModal()
  const router = useRouter()

  const form = useForm<ChatPayload>({
    resolver: zodResolver(chatSchema),
  })

  const { isLoading, mutate: sendMessage } = useMutation({
    mutationFn: async (values: ChatPayload) => {
      const url = queryString.stringifyUrl({
        url: apiUrl,
        query,
      })

      await axios.post(url, values)
    },

    onSuccess: () => {
      form.setValue('content', '')
      router.refresh()
      document.getElementById('chat-main-input')?.focus()
    },

    onError: (error) => {
      console.log(error)

      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 422:
            return toast.error('Oh no! Something went wrong.', {
              description: error?.response?.data,
            })
          case 401:
            return toast.error('Unauthenticated', {
              description: 'Please login to send a message.',
            })
          case 404:
            return toast.error('Oh no! Something went wrong.', {
              description: error?.response?.data,
            })
          case 405:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Invalid Request Method',
            })

          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Error while sending message, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while sending message, please try again.',
        })
      }
    },
  })

  const onSubmit: SubmitHandler<ChatPayload> = async (values) => {
    if (values.content.trim() === '') return
    sendMessage(values)
  }

  return (
    <Form {...form}>
      <form
        className='border-t fixed bottom-0 lg:max-w-[calc(100%-19.5rem)] w-full bg-background z-30'
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative p-4'>
                  <button
                    type='button'
                    onClick={() => onOpen('fileMessage', { apiUrl, query })}
                    className='absolute top-7 left-8 h-6 w-6 bg-muted-foreground hover:bg-muted-foreground/70 transition-colors rounded-full p-1 flex items-center justify-center'
                  >
                    <IoMdAdd className='text-primary-foreground' />
                  </button>
                  <Input
                    id='chat-main-input'
                    disabled={isLoading}
                    className='px-14 py-6'
                    placeholder={`Message ${
                      type === 'conversation' ? name : '#' + name
                    }`}
                    {...field}
                  />
                  <div className='absolute top-7 right-8'>
                    <EmojiPicker
                      disabled={isLoading}
                      onChange={(emoji: string) =>
                        field.onChange(
                          `${field?.value ? field?.value : ''}${emoji}`
                        )
                      }
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
