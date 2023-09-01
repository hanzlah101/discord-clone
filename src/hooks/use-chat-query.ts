import axios from 'axios'
import queryString from 'query-string'
import { useInfiniteQuery } from '@tanstack/react-query'

import { MessageWithMemberAndProfile } from '@/types'
import { useSocket } from '@/components/providers/socker-provider'

interface ChatQueryProps {
  queryKey: string
  apiUrl: string
  paramKey: 'channelId' | 'conversationId'
  paramValue: string
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket()

  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = queryString.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    )

    const { data } = await axios.get(url)
    return data as { items: MessageWithMemberAndProfile[]; nextCursor: string }
  }

  return useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    refetchInterval: isConnected ? false : 1000,
  })
}
