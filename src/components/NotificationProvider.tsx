"use client"

import React, { createContext, useCallback, useContext, useMemo } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

type NotificationType = "success" | "error" | "info"

interface NotificationContextValue {
  addNotification: (message: string, type?: NotificationType) => void
  removeNotification: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const addNotification = useCallback((message: string, type: NotificationType = "info") => {
    switch (type) {
      case "success":
        toast.success(message)
        break
      case "error":
        toast.error(message)
        break
      case "info":
      default:
        toast.info(message)
        break
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    toast.dismiss(id)
  }, [])

  const ctxValue = useMemo<NotificationContextValue>(() => ({
    addNotification,
    removeNotification,
    success: (message: string) => addNotification(message, "success"),
    error: (message: string) => addNotification(message, "error"),
    info: (message: string) => addNotification(message, "info"),
  }), [addNotification, removeNotification])

  return (
    <NotificationContext.Provider value={ctxValue}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  )
}

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return ctx
}
