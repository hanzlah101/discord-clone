'use client'

import * as React from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import Dropzone, { FileWithPath } from 'react-dropzone'
import { UploadIcon, Loader2, XIcon } from 'lucide-react'
import {
  type SubmitHandler,
  useForm,
  ControllerRenderProps,
} from 'react-hook-form'

import { cn } from '@/libs/utils'
import { uploadFiles } from '@/libs/upload'
import { useModal } from '@/hooks/use-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ServerPayload, serverSchema } from '@/libs/validations/server'
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

export const CreateServerModal = () => {
  const router = useRouter()
  const { isOpen, onClose, type } = useModal()

  const form = useForm<ServerPayload>({
    resolver: zodResolver(serverSchema),
  })

  const { isLoading: isUploading, mutate: upload } = useMutation({
    mutationFn: async ({
      file,
      field,
    }: {
      file: FileWithPath
      field: ControllerRenderProps<ServerPayload, 'image'>
    }) => {
      {
        const [res] = await uploadFiles({
          endpoint: 'serverImage',
          files: [file],
        })

        if (res) {
          field.onChange(res.url)
        }
      }
    },
  })

  const { isLoading, mutate: createServer } = useMutation({
    mutationFn: async (values: ServerPayload) => {
      await axios.post('/api/servers', values)
    },

    onSuccess: () => {
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
              description: 'Please login to create a server',
            })

          default:
            return toast.error('Oh no! Something went wrong.', {
              description: 'Error while creating server, please try again.',
            })
        }
      } else {
        return toast.error('Oh no! Something went wrong.', {
          description: 'Error while creating server, please try again.',
        })
      }
    },
  })

  const onSubmit: SubmitHandler<ServerPayload> = (values) => {
    createServer(values)
  }

  const isModalOpen = React.useMemo(
    () => isOpen && type === 'createServer',
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
            Customize your server
          </DialogTitle>
          <DialogDescription>
            Give your server a personality with a name and image. You can always
            change this later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
          >
            <FormField
              control={form.control}
              name='image'
              render={({ field, fieldState: { error } }) => (
                <FormItem className='px-6'>
                  <FormLabel>Select an Image</FormLabel>
                  <FormControl>
                    <>
                      {field?.value ? (
                        <div className='relative w-20 h-20 rounded-full mx-auto border border-muted-foreground'>
                          <Image
                            fill
                            alt='image_'
                            src={field.value}
                            className='object-cover rounded-full overflow-hidden'
                          />
                          <Button
                            size='fit'
                            type='button'
                            disabled={isLoading}
                            variant={'destructive'}
                            onClick={() => field.onChange(null)}
                            className='absolute top-0 right-0 rounded-full p-1 z-10'
                          >
                            <XIcon className='w-3 h-3' />
                          </Button>
                        </div>
                      ) : (
                        <Dropzone
                          maxFiles={1}
                          multiple={false}
                          maxSize={4 * 1024 * 1024}
                          disabled={isLoading || isUploading}
                          accept={{
                            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                          }}
                          onDropRejected={() =>
                            toast.error('File not allowed', {
                              description: 'Please select other image.',
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
                                'relative !outline-none w-full h-44 border-2 rounded-md border-dashed flex flex-col items-center justify-center',
                                isDragActive
                                  ? 'border-foreground text-foreground'
                                  : error
                                  ? '!border-destructive text-destructive'
                                  : 'border-muted-foreground text-muted-foreground'
                              )}
                            >
                              {isUploading ? (
                                <Loader2 className='w-10 h-10 animate-spin' />
                              ) : (
                                <span className='gap-y-2 flex flex-col items-center justify-center'>
                                  <UploadIcon className='w-10 h-10' />
                                  <p className='text-xl font-medium'>
                                    Select or drop an image
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
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='px-6'>
                  <FormLabel>Server name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='bg-secondary py-4 px-3'>
              <Button
                type='submit'
                isLoading={isLoading}
                className='min-w-[100px]'
                disabled={isLoading || isUploading}
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
