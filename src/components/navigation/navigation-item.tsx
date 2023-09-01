'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

import { cn } from '@/libs/utils'
import { ActionTooltip } from '@/components/action-tooltip'

interface NavigationItemProps {
  id: string
  image: string
  name: string
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  id,
  name,
  image,
}) => {
  const router = useRouter()
  const params = useParams()

  const handleClick = React.useCallback(() => {
    router.push(`/server/${id}`)
  }, [router, id])

  return (
    <ActionTooltip side='right' align='center' label={name}>
      <button
        onClick={handleClick}
        className='group relative flex items-center'
      >
        <div
          className={cn(
            'absolute left-0 bg-foreground rounded-r-full transition-all w-1.5 duration-300',
            params?.serverId !== id ? 'group-hover:h-[20px] h-0' : 'h-[36px]'
          )}
        />

        <div
          className={cn(
            'relative group flex mx-3 h-12 w-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 overflow-hidden',
            params?.serverId !== id &&
              'bg-foreground/10 text-foreground rounded-[16px]'
          )}
        >
          <Image fill src={image} alt={name} className='object-cover' />
        </div>
      </button>
    </ActionTooltip>
  )
}
