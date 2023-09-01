import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { currentProfile } from '@/libs/current-profile'
import { ScrollArea } from '@/components/ui/scroll-area'

import { NavigationItem } from './navigation-item'
import { NavigationAction } from './navigation-action'

export const NavigationSidebar = async () => {
  const profile = await currentProfile()
  if (!profile) return redirect('/')

  const servers = await db.server.findMany({
    where: {
      members: {
        some: { profileId: profile?.id },
      },
    },
  })

  return (
    <div className='space-y-4 flex flex-col items-center h-full text-foreground bg-neutral-200 dark:bg-primary-foreground py-3'>
      <NavigationAction />
      <Separator className='h-0.5 bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto' />
      <ScrollArea className='flex-1 w-full'>
        {servers.map((server) => (
          <div key={server.id} className='mb-4'>
            <NavigationItem
              id={server.id}
              name={server.name}
              image={server.image}
            />
          </div>
        ))}
      </ScrollArea>
      <div className='pb-3 mt-auto flex items-center flex-col gap-y-4'>
        <ThemeToggle />
        <UserButton
          afterSignOutUrl='/sign-in'
          appearance={{
            elements: {
              avatarBox: 'h-12 w-12',
            },
          }}
        />
      </div>
    </div>
  )
}
