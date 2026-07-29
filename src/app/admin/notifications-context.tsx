'use client'

import { createContext, useContext } from 'react'

interface NotificationContextType {
  pendingCount: number
  refresh: () => void
}

export const NotificationContext = createContext<NotificationContextType>({
  pendingCount: 0,
  refresh: () => {},
})

export function useNotifications() {
  return useContext(NotificationContext)
}
