import { redirect } from 'next/navigation'
import { ChannelType, MemberRole } from '@prisma/client'
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react'

import { db } from '@/libs/db'
import { Separator } from '@/components/ui/separator'
import { currentProfile } from '@/libs/current-profile'
import { ScrollArea } from '@/components/ui/scroll-area'

import { ServerHeader } from './server-header'
import { ServerSearch } from './server-search'
import { ServerMember } from './server-member'
import { ServerSection } from './server-section'
import { ServerChannel } from './server-channel'

interface ServerSidebarProps {
  serverId: string
}

const iconMap = {
  [ChannelType.Text]: <Hash className='w-4 h-4 mr-2' />,
  [ChannelType.Audio]: <Mic className='w-4 h-4 mr-2' />,
  [ChannelType.Video]: <Video className='w-4 h-4 mr-2' />,
}

const roleIconMap = {
  [MemberRole.Guest]: null,
  [MemberRole.Moderator]: <ShieldCheck className='w-4 h-4 mr-2 text-primary' />,
  [MemberRole.Admin]: <ShieldAlert className='w-4 h-4 mr-2 text-rose-500' />,
}

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile()

  if (!profile) return redirect('/')

  const server = await db.server.findFirst({
    where: {
      AND: [
        { id: serverId },
        { members: { some: { profileId: profile?.id } } },
      ],
    },
    include: {
      channels: {
        orderBy: { createdAt: 'asc' },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: { role: 'asc' },
      },
    },
  })

  if (!server) return redirect('/')

  const textChannels = server?.channels?.filter(
    (channel) => channel.type === ChannelType.Text
  )

  const audioChannels = server?.channels?.filter(
    (channel) => channel.type === ChannelType.Audio
  )

  const videoChannels = server?.channels?.filter(
    (channel) => channel.type === ChannelType.Video
  )

  const members = server?.members?.filter(
    (member) => member.profileId !== profile?.id
  )

  const role = server?.members?.find(
    (member) => member.profileId === profile?.id
  )?.role

  return (
    <div className='flex flex-col h-full text-foreground w-full bg-secondary'>
      <ServerHeader server={server} role={role} />
      <ScrollArea className='flex-1 px-3'>
        <div className='mt-2'>
          <ServerSearch
            data={[
              {
                label: 'Text Channels',
                type: 'channel',
                data: textChannels?.map((channel) => {
                  return {
                    id: channel.id,
                    name: channel.name,
                    icon: iconMap[channel.type],
                  }
                }),
              },
              {
                label: 'Voice Channels',
                type: 'channel',
                data: audioChannels?.map((channel) => {
                  return {
                    id: channel.id,
                    name: channel.name,
                    icon: iconMap[channel.type],
                  }
                }),
              },
              {
                label: 'Video Channels',
                type: 'channel',
                data: videoChannels?.map((channel) => {
                  return {
                    id: channel.id,
                    name: channel.name,
                    icon: iconMap[channel.type],
                  }
                }),
              },
              {
                label: 'Members',
                type: 'member',
                data: members?.map((member) => {
                  return {
                    id: member.id,
                    name: member?.profile?.name,
                    icon: roleIconMap[member?.role],
                  }
                }),
              },
            ]}
          />
        </div>
        <Separator className='bg-input rounded-md my-2 w-full' />
        {!!textChannels?.length && (
          <div className='mb-2'>
            <ServerSection
              role={role}
              label='Text Channels'
              sectionType='channels'
              channelType={ChannelType.Text}
            />
            {textChannels?.map((channel) => (
              <ServerChannel
                role={role}
                server={server}
                key={channel?.id}
                channel={channel}
              />
            ))}
          </div>
        )}

        {!!audioChannels?.length && (
          <div className='mb-2'>
            <ServerSection
              role={role}
              label='Voice Channels'
              sectionType='channels'
              channelType={ChannelType.Audio}
            />
            {audioChannels?.map((channel) => (
              <ServerChannel
                role={role}
                server={server}
                key={channel?.id}
                channel={channel}
              />
            ))}
          </div>
        )}

        {!!videoChannels?.length && (
          <div className='mb-2'>
            <ServerSection
              role={role}
              label='Video Channels'
              sectionType='channels'
              channelType={ChannelType.Video}
            />
            {videoChannels?.map((channel) => (
              <ServerChannel
                role={role}
                server={server}
                key={channel?.id}
                channel={channel}
              />
            ))}
          </div>
        )}

        {!!members?.length && (
          <div className='mb-2'>
            <ServerSection
              role={role}
              label='Members'
              server={server}
              sectionType='members'
            />
            {members?.map((member) => (
              <ServerMember key={member?.id} server={server} member={member} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
