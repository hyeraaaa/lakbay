"use client"

import { useState, useCallback } from "react"

export interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info"
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const addNotification = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }, [removeNotification])

  const success = useCallback((message: string) => addNotification(message, "success"), [addNotification])
  const error = useCallback((message: string) => addNotification(message, "error"), [addNotification])
  const info = useCallback((message: string) => addNotification(message, "info"), [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
  }
}
