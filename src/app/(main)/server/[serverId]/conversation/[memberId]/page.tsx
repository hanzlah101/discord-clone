import { redirect } from 'next/navigation'
import { redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { MediaRoom } from '@/components/media-room'
import { currentProfile } from '@/libs/current-profile'
import { ChatInput } from '@/components/chat/chat-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatHeader } from '@/components/chat/chat-header'
import { getOrCreateConversation } from '@/libs/conversation'
import { ChatMessages } from '@/components/chat/chat-messages'

interface SingleConversationPageProps {
  params: {
    memberId: string
    serverId: string
  }
  searchParams: {
    video?: boolean
  }
}

const SingleConversationPage = async ({
  params,
  searchParams,
}: SingleConversationPageProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirectToSignIn()
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params?.serverId,
      profileId: profile?.id,
    },
    include: {
      profile: true,
    },
  })

  if (!currentMember) {
    return redirect('/')
  }

  const conversation = await getOrCreateConversation(
    currentMember?.id,
    params?.memberId
  )

  if (!conversation) {
    return redirect(`/servers/${params.serverId}`)
  }

  const { memberOne, memberTwo } = conversation

  const otherMember =
    memberOne?.profileId === profile?.id ? memberTwo : memberOne

  return (
    <div className='bg-background flex flex-col h-full max-h-screen overflow-hidden'>
      <ChatHeader
        type='conversation'
        serverId={params?.serverId}
        name={otherMember?.profile?.name}
        image={otherMember?.profile?.image}
      />

      {searchParams?.video && (
        <MediaRoom chatId={conversation?.id} video audio />
      )}
      {!searchParams?.video && (
        <>
          <ScrollArea className='h-full flex-1 min-h-[calc(100vh-10rem)] mb-20 overflow-y-auto'>
            <ChatMessages
              member={currentMember}
              name={otherMember?.profile?.name}
              chatId={conversation?.id}
              type='conversation'
              apiUrl='/api/direct-messages'
              paramKey='conversationId'
              paramValue={conversation.id}
              socketUrl='/api/socket/direct-messages'
              socketQuery={{
                conversationId: conversation?.id,
              }}
            />
          </ScrollArea>
          <ChatInput
            name={otherMember?.profile?.name}
            type='conversation'
            apiUrl='/api/socket/direct-messages'
            query={{
              conversationId: conversation?.id,
            }}
          />
        </>
      )}
    </div>
  )
}

export default SingleConversationPage
