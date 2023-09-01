import { redirect } from 'next/navigation'
import { redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { MediaRoom } from '@/components/media-room'
import { currentProfile } from '@/libs/current-profile'
import { ChatInput } from '@/components/chat/chat-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatHeader } from '@/components/chat/chat-header'
import { ChatMessages } from '@/components/chat/chat-messages'

interface SingleChannelPageProps {
  params: {
    serverId: string
    channelId: string
  }
}

const SingleChannelPage = async ({ params }: SingleChannelPageProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirectToSignIn()
  }

  const channel = await db.channel.findFirst({
    where: {
      id: params?.channelId,
    },
  })

  const member = await db.member.findFirst({
    where: {
      serverId: params?.serverId,
      profileId: profile?.id,
    },
  })

  if (!channel || !member) {
    return redirect('/')
  }

  return (
    <div className='flex flex-col h-full max-h-screen overflow-hidden'>
      <ChatHeader
        type='channel'
        name={channel?.name}
        serverId={channel?.serverId}
      />
      {channel?.type === 'Text' && (
        <>
          <ScrollArea className='h-full flex-1 min-h-[calc(100vh-10rem)] mb-20 overflow-y-auto'>
            <ChatMessages
              type='channel'
              member={member}
              name={channel?.name}
              chatId={channel?.id}
              apiUrl='/api/messages'
              socketUrl='/api/socket/messages'
              paramKey='channelId'
              paramValue={channel?.id}
              socketQuery={{
                channelId: channel?.id,
                serverId: channel?.serverId,
              }}
            />
          </ScrollArea>
          <ChatInput
            name={channel?.name}
            type='channel'
            apiUrl='/api/socket/messages'
            query={{
              channelId: channel?.id,
              serverId: channel?.serverId,
            }}
          />
        </>
      )}

      {channel?.type === 'Audio' && (
        <MediaRoom chatId={channel?.id} video={false} audio={true} />
      )}

      {channel?.type === 'Video' && (
        <MediaRoom chatId={channel?.id} video={true} audio={true} />
      )}
    </div>
  )
}

export default SingleChannelPage
