'use client'

import * as React from 'react'

import { cn } from '@/libs/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  src?: string
  name?: string
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  className,
}) => {
  return (
    <Avatar className={cn('w-10 h-10', className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className='text-xs'>
        {name?.charAt(0) ?? ''}
      </AvatarFallback>
    </Avatar>
  )
}
