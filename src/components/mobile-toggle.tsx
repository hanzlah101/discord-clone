import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ServerSidebar } from '@/components/server/server-sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NavigationSidebar } from '@/components/navigation/navigation-sidebar'

export const MobileToggle = ({ serverId }: { serverId: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='lg:hidden mr-3 '>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='flex p-0 gap-0 w-fit'>
        <div className='w-[72px]'>
          <NavigationSidebar />
        </div>
        <div className='w-60'>
          <ServerSidebar serverId={serverId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
