'use client'

import { Loader2 } from 'lucide-react'

const Loading = () => {
  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <Loader2 className='text-muted-foreground w-12 h-12 animate-spin' />
    </div>
  )
}

export default Loading
