import { Hash } from 'lucide-react'

import { VideoButton } from './video-button'
import { UserAvatar } from '@/components/user-avatar'
import { MobileToggle } from '@/components/mobile-toggle'
import { SocketIndicator } from '@/components/socket-indicator'

interface ChatHeaderProps {
  serverId: string
  name: string
  type: 'channel' | 'conversation'
  image?: string
}

export const ChatHeader = ({
  type,
  name,
  image,
  serverId,
}: ChatHeaderProps) => {
  return (
    <div className='text-base shrink-0 font-semibold px-3 flex items-center h-12 border-b'>
      <MobileToggle serverId={serverId} />
      {type === 'channel' && (
        <Hash className='w-5 h-5 mr-2 text-muted-foreground' />
      )}
      {type === 'conversation' && (
        <UserAvatar src={image} name={name} className='w-8 h-8 mr-2' />
      )}
      <p className='font-semibold text-base text-foreground'>{name}</p>
      <div className='ml-auto flex items-center'>
        {type === 'conversation' && <VideoButton />}
        <SocketIndicator />
      </div>
    </div>
  )
}
