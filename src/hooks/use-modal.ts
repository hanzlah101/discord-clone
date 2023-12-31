import { create } from 'zustand'
import { Channel, ChannelType, Server } from '@prisma/client'

export type ModalType =
  | 'createServer'
  | 'invite'
  | 'editServer'
  | 'members'
  | 'createChannel'
  | 'leaveServer'
  | 'deleteServer'
  | 'deleteChannel'
  | 'editChannel'
  | 'fileMessage'
  | 'deleteMessage'

interface ModelData {
  server?: Server
  channel?: Channel
  channelType?: ChannelType
  apiUrl?: string
  query?: Record<string, any>
}

interface ModalStoreProps {
  type: ModalType | null
  isOpen: boolean
  data: ModelData
  onOpen: (type: ModalType, data?: ModelData) => void
  onClose: () => void
}

export const useModal = create<ModalStoreProps>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set(() => ({ isOpen: true, type, data })),
  onClose: () => set(() => ({ type: null, isOpen: false })),
}))
