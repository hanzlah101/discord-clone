'use client'

import * as React from 'react'
import axios from 'axios'

import '@livekit/components-styles'
import { Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Channel } from '@prisma/client'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'

interface MediaRoomProps {
  chatId: string
  video: boolean
  audio: boolean
}

export const MediaRoom: React.FC<MediaRoomProps> = ({
  chatId,
  video,
  audio,
}) => {
  const { user } = useUser()
  const [token, setToken] = React.useState('')

  React.useEffect(() => {
    if (!user?.firstName || !user?.lastName) return
    const name = `${user?.firstName} ${user?.lastName}`

    ;(async () => {
      try {
        const { data } = await axios.get(
          `/api/livekit?room=${chatId}&username=${name}`
        )
        setToken(data?.token)
      } catch (error) {
        console.log(error)
      }
    })()
  }, [user?.firstName, user?.lastName, chatId])

  if (token === '') {
    return (
      <div className='flex flex-col flex-1 items-center justify-center'>
        <Loader2 className='w-8 h-8 text-muted-foreground animate-spin my-4' />
        <p className='text-xs text-muted-foreground'>Loading...</p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      video={video}
      audio={audio}
      connect={true}
      data-lk-theme='default'
      className='overflow-y-auto'
      style={{ height: '100dvh' }}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
    >
      <VideoConference />
    </LiveKitRoom>
  )
}
