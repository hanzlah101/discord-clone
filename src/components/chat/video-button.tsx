'use client'

import * as React from 'react'
import queryString from 'query-string'
import { Video, VideoOff } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { ActionTooltip } from '@/components/action-tooltip'

export const VideoButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isVideo = searchParams?.get('video')

  const Icon = isVideo ? VideoOff : Video
  const tooltipLabel = isVideo ? 'End Video Call' : 'Start Video Call'

  const handleClick = React.useCallback(() => {
    const url = queryString.stringifyUrl(
      {
        url: pathname ?? '',
        query: {
          video: isVideo ? undefined : true,
        },
      },
      { skipNull: true }
    )

    router.push(url)
  }, [router, pathname, isVideo])

  return (
    <ActionTooltip label={tooltipLabel} side='bottom'>
      <button onClick={handleClick} className='mr-4'>
        <Icon className='h-6 w-6 text-muted-foreground hover:text-foreground transition-colors' />
      </button>
    </ActionTooltip>
  )
}
