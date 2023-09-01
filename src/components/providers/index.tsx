'use client'

import * as React from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

import { ModalProvider } from './modal-provider'
import { SocketProvider } from './socker-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        enableSystem
        attribute='class'
        defaultTheme='dark'
        storageKey='discord-clone'
      >
        <SocketProvider>
          <Toaster />
          <ModalProvider />
          {children}
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
