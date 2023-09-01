'use client'

import * as React from 'react'
import axios from 'axios'
import Image from 'next/image'
import Dropzone from 'react-dropzone'
import queryString from 'query-string'

import { z } from 'zod'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileWithPath } from 'react-dropzone'
import { UploadIcon, Loader2, XIcon, FileIcon } from 'lucide-react'
import {
  type SubmitHandler,
  useForm,
  ControllerRenderProps,
} from 'react-hook-form'

import { cn } from '@/libs/utils'
import { uploadFiles } from '@/libs/upload'
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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  fileUrl: z
    .string({ required_error: 'Please select an attachment.' })
    .min(1, { message: 'Please select an attachment.' })
    .nonempty({ message: 'Please select an attachment.' }),
})

type Payload = z.infer<typeof schema>

export const MessageFileModal = () => {
  const router = useRouter()
  const { isOpen, onClose, type, data } = useModal()
  const { apiUrl, query } = data

  const form = useForm<Payload>({
    resolver: zodResolver(schema),
  })

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'fileMessage',
    [isOpen, type]
  )

  const handleClose = React.useCallback(() => {
    onClose()
    form.reset()
  }, [form, onClose])

  const { isLoading: isUploading, mutate: upload } = useMutation({
    mutationFn: async ({
      file,
      field,
    }: {
      file: FileWithPath
      field: ControllerRenderProps<Payload, 'fileUrl'>
    }) => {
      {
        const [res] = await uploadFiles({
          endpoint: 'messageFile',
          files: [file],
        })

        if (res) {
          field.onChange(res.url)
        }
      }
    },
  })

  const { isLoading, mutate: sendMessage } = useMutation({
    mutationFn: async (values: Payload) => {
      const url = queryString.stringifyUrl({
        url: apiUrl ?? '',
        query,
      })

      await axios.post(url, { ...values, content: values?.fileUrl })
    },

    onSuccess: () => {
      form.setValue('fileUrl', '')
      router.refresh()
      handleClose()
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
              description: 'Please login to send a message',
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

  const onSubmit: SubmitHandler<Payload> = (values) => {
    sendMessage(values)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='bg-background p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl font-bold'>
            Add an Attachment
          </DialogTitle>
          <DialogDescription>Send a file as a message.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
          >
            <FormField
              control={form.control}
              name='fileUrl'
              render={({ field }) => {
                const fileType = field?.value?.split('.').pop()

                return (
                  <FormItem className='px-6'>
                    <FormLabel>Select a File</FormLabel>
                    <FormControl>
                      <>
                        {field?.value ? (
                          <>
                            {fileType === 'pdf' ? (
                              <div className='relative flex items-center p-2 rounded-md bg-foreground/10'>
                                <FileIcon className='w-10 h-10 fill-indigo-200 stroke-primary' />
                                <a
                                  target='_blank'
                                  href={field?.value}
                                  rel='noopener noreferrer'
                                  className='ml-2 text-xs text-primary hover:underline'
                                >
                                  {field?.value}
                                </a>
                                <Button
                                  size='fit'
                                  type='button'
                                  disabled={isLoading}
                                  variant={'destructive'}
                                  onClick={() => field.onChange(null)}
                                  className='absolute -top-2 -right-2 rounded-full p-1 z-10'
                                >
                                  <XIcon className='w-3 h-3' />
                                </Button>
                              </div>
                            ) : (
                              <div className='relative w-full h-44 rounded-md mx-auto border border-muted-foreground'>
                                <Image
                                  fill
                                  alt='image_'
                                  src={field?.value}
                                  className='object-cover overflow-hidden'
                                />
                                <Button
                                  size='fit'
                                  type='button'
                                  disabled={isLoading}
                                  variant={'destructive'}
                                  onClick={() => field.onChange(null)}
                                  className='absolute -top-2 -right-2 rounded-full p-1 z-10'
                                >
                                  <XIcon className='w-3 h-3' />
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <Dropzone
                            maxFiles={1}
                            multiple={false}
                            maxSize={50 * 1024 * 1024}
                            disabled={isLoading || isUploading}
                            accept={{
                              'pdf/*': ['.pdf'],
                              'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                            }}
                            onDropRejected={() =>
                              toast.error('File not allowed', {
                                description: 'Please select other file.',
                              })
                            }
                            onDrop={(acceptedFiles) =>
                              upload({ file: acceptedFiles[0], field })
                            }
                          >
                            {({ getRootProps, isDragActive }) => (
                              <div
                                {...getRootProps()}
                                className={cn(
                                  'relative w-full h-44 border-2 rounded-md border-dashed flex flex-col items-center justify-center',
                                  isDragActive
                                    ? 'border-foreground text-foreground'
                                    : ' border-muted-foreground text-muted-foreground'
                                )}
                              >
                                {isUploading ? (
                                  <Loader2 className='w-10 h-10 animate-spin' />
                                ) : (
                                  <span className='gap-y-2 flex flex-col items-center justify-center'>
                                    <UploadIcon className='w-10 h-10' />
                                    <p className='text-xl font-medium'>
                                      Select or drop a file
                                    </p>
                                  </span>
                                )}
                              </div>
                            )}
                          </Dropzone>
                        )}
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <DialogFooter className='bg-secondary py-4 px-3'>
              <Button
                type='submit'
                isLoading={isLoading}
                className='min-w-[100px]'
                disabled={isLoading || isUploading}
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
