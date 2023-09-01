'use client'

import { IoMdAdd } from 'react-icons/io'

import { useModal } from '@/hooks/use-modal'
import { ActionTooltip } from '@/components/action-tooltip'

export const NavigationAction = () => {
  const { onOpen } = useModal()

  return (
    <ActionTooltip label='Add a Server' align='center' side='right'>
      <button className='group flex items-center'>
        <div
          onClick={() => onOpen('createServer')}
          className='flex mx-3 h-12 w-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 overflow-hidden items-center justify-center bg-background group-hover:bg-emerald-500'
        >
          <IoMdAdd
            size={25}
            className='group-hover:text-white text-emerald-500 transition-colors'
          />
        </div>
      </button>
    </ActionTooltip>
  )
}
