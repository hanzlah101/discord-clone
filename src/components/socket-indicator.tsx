'use client'

import { Badge } from '@/components/ui/badge'
import { useSocket } from '@/components/providers/socker-provider'

export const SocketIndicator = () => {
  const { isConnected } = useSocket()
  if (!isConnected) {
    return (
      <Badge
        variant={'outline'}
        className='bg-yellow-600 text-white border-none cursor-pointer sr-only'
      >
        Fallback: Polling every 1s
      </Badge>
    )
  }

  return (
    <Badge
      variant={'outline'}
      className='bg-emerald-600 text-white border-none cursor-pointer sr-only'
    >
      Live: Real-Time Updates
    </Badge>
  )
}
