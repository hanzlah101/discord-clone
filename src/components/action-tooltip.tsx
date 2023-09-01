'use client'

import * as React from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ActionTooltipProps {
  label: string
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'right' | 'left'
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  children,
  side,
  align,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p className='text-sm'>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
