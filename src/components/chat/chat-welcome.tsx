'use client'

import * as React from 'react'
import { Hash } from 'lucide-react'

interface ChatWelcomeProps {
  name: string
  type: 'channel' | 'conversation'
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({ name, type }) => {
  return (
    <div className='space-y-2 px-4 mb-4'>
      {type === 'channel' && (
        <div className='h-[75px] w-[75px] bg-foreground/10 rounded-full flex items-center justify-center'>
          <Hash className='w-12 h-12' />
        </div>
      )}
      <h3 className='sm:text-2xl lg:text-3xl text-xl font-bold'>
        {type === 'channel' ? 'Welcome to #' : ''}
        {name}
      </h3>
      <p className='text-muted-foreground text-sm'>
        {type === 'channel'
          ? `This is the start of the #${name} channel`
          : `This is the start of your conversation with ${name}`}
      </p>
    </div>
  )
}
