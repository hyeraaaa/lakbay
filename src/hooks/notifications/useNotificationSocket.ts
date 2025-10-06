"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useJWT } from "../../contexts/JWTContext"

export interface NotificationSocketData {
  notification_id: number
  title: string
  message: string
  type: string
  is_read: boolean
  related_id: number | null
  created_at: string
}

export interface NotificationCountUpdate {
  unread_count: number
}

export const useNotificationSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useJWT()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
      setError("API base URL not configured")
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined
    if (!token) {
      setError("No access token found")
      return
    }

    // Create socket connection to notifications namespace
    const newSocket = io(`${baseUrl}/notifications`, {
      transports: ["websocket"],
      auth: {
        token,
      }
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    const onConnect = () => {
      setIsConnected(true)
      setError(null)
      console.log("🔔 Notification socket connected successfully")
    }

    const onDisconnect = (reason: string) => {
      setIsConnected(false)
      console.log("🔔 Notification socket disconnected:", reason)
    }

    const onError = (err: Error | unknown) => {
      const errorMessage = err instanceof Error ? err.message : "Socket connection error"
      setError(errorMessage)
      console.error("🔔 Notification socket error:", err)
    }

    newSocket.on('connect', onConnect)
    newSocket.on('disconnect', onDisconnect)
    newSocket.on('error', onError)

    return () => {
      newSocket.off('connect', onConnect)
      newSocket.off('disconnect', onDisconnect)
      newSocket.off('error', onError)
      newSocket.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, user?.id])

  return {
    socket,
    isConnected,
    error,
    socketRef
  }
}
