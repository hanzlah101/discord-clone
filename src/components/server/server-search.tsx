'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { cn } from '@/libs/utils'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface ServerSearchProps {
  data: {
    label: string
    type: 'channel' | 'member'
    data:
      | {
          id: string
          name: string
          icon: React.ReactNode
        }[]
      | undefined
  }[]
}

export const ServerSearch: React.FC<ServerSearchProps> = ({ data }) => {
  const [open, setOpen] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)
  const router = useRouter()
  const params = useParams()

  React.useEffect(() => {
    if (navigator?.userAgent?.includes('Macintosh')) {
      setIsMac(true)
    }
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleClick = React.useCallback(
    ({ id, type }: { id: string; type: 'channel' | 'member' }) => {
      setOpen(false)
      if (type === 'member') {
        return router.push(`/server/${params?.serverId}/conversation/${id}`)
      } else if (type === 'channel') {
        return router.push(`/server/${params?.serverId}/channel/${id}`)
      }
    },
    [params, router]
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='group p-3 rounded-md flex items-center gap-x-2 w-full hover:bg-foreground/5 transition-colors'
      >
        <Search className='w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors' />
        <p className='font-medium text-sm text-muted-foreground group-hover:text-accent-foreground transition-colors'>
          Search
        </p>
        <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto'>
          <span className={cn(isMac ? 'text-xs' : 'text-[10px]')}>
            {isMac ? '⌘' : 'Ctrl'}
          </span>
          S
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Search for channels or members' />
        <CommandList>
          <CommandEmpty>No Results Found.</CommandEmpty>
          {data.map(({ label, data, type }) => {
            if (!data?.length) return null
            return (
              <CommandGroup key={label} heading={label}>
                {data?.map(({ id, name, icon }) => (
                  <CommandItem
                    key={id}
                    onSelect={() => handleClick({ id, type })}
                  >
                    {icon}
                    <span>{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}
