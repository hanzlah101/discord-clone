'use client'

import * as React from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

import { Smile } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

interface EmojiPickerProps {
  onChange: (value: string) => void
  disabled?: boolean
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onChange,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false)

  const { resolvedTheme } = useTheme()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} onClick={() => setOpen(true)}>
        <Smile className='h-5 w-5 text-muted-foreground hover:text-foreground transition-colors' />
      </PopoverTrigger>
      <PopoverContent
        side='right'
        sideOffset={40}
        className='p-0 bg-transparent border-none shadow-none drop-shadow-none mb-16 w-auto'
      >
        <Picker
          data={data}
          theme={resolvedTheme}
          onEmojiSelect={(emoji: any) => {
            onChange(emoji.native)
            setOpen(false)
            document.getElementById('chat-main-input')?.focus()
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
