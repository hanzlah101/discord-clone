'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Member } from '@prisma/client'
import { Loader2, AlertCircle } from 'lucide-react'

import { ChatItem } from './chat-item'
import { ChatWelcome } from './chat-welcome'
import { useChatQuery } from '@/hooks/use-chat-query'
import { useChatSocket } from '@/hooks/use-chat-socket'
import { useChatScroll } from '@/hooks/use-chat-scroll'

interface ChatMessagesProps {
  name: string
  member: Member
  chatId: string
  apiUrl: string
  socketUrl: string
  socketQuery: Record<string, string>
  paramKey: 'channelId' | 'conversationId'
  paramValue: string
  type: 'channel' | 'conversation'
}

const DATE_FORMAT = 'd MMM yyyy, HH:mm'

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  name,
  member,
  chatId,
  apiUrl,
  socketQuery,
  socketUrl,
  paramKey,
  paramValue,
  type,
}) => {
  const queryKey = `chat:${chatId}`
  const addKey = `chat:${chatId}:messages`
  const updateKey = `chat:${chatId}:messages:update`

  const chatRef = React.useRef<React.ElementRef<'div'>>(null)
  const bottomRef = React.useRef<React.ElementRef<'div'>>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    })

  useChatSocket({ queryKey, addKey, updateKey })

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !!hasNextPage && !isFetchingNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  })

  if (status === 'loading') {
    return (
      <div className='flex flex-col min-h-[calc(100vh-10rem)] h-full items-center justify-center'>
        <Loader2 className='w-8 h-8 text-muted-foreground animate-spin my-4' />
        <p className='text-xs text-muted-foreground'>Loading Mesages...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className='flex flex-col min-h-[calc(100vh-10rem)] h-full items-center justify-center'>
        <AlertCircle className='w-8 h-8 text-muted-foreground my-4' />
        <p className='text-xs text-muted-foreground'>Something went wrong!</p>
      </div>
    )
  }

  return (
    <div
      ref={chatRef}
      className='flex flex-col min-h-[calc(100vh-10rem)] w-full h-full p-4'
    >
      {!hasNextPage && <div className='flex-1' />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className='flex justify-center'>
          {isFetchingNextPage ? (
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground my-4' />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className='text-muted-foreground hover:text-foreground transition-colors text-xs my-5'
            >
              Load Previous Messages
            </button>
          )}
        </div>
      )}
      <div className='flex flex-col-reverse mt-auto'>
        {data?.pages?.map((group, index) => (
          <React.Fragment key={index}>
            {group?.items?.map((message) => (
              <ChatItem
                key={message?.id}
                id={message?.id}
                member={message?.member}
                content={message?.content}
                fileUrl={message?.fileUrl}
                deleted={message?.deleted}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
                currentMember={member}
                isUpdated={message?.updatedAt !== message?.createdAt}
                timestamp={format(new Date(message?.createdAt), DATE_FORMAT)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
