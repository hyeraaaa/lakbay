"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useJWT } from "@/contexts/JWTContext"
import { generalChatService, type GeneralChatMessage, type GeneralChatSessionSummary } from "@/services/generalChatService"

export type UseGeneralChatSocketArgs = {
  sessionId: number | null
  selectedChat: string | null
  setSessionId: (v: number | null) => void
  setMessages: (updater: ((prev: GeneralChatMessage[]) => GeneralChatMessage[]) | GeneralChatMessage[]) => void
  setSessions: (v: GeneralChatSessionSummary[]) => void
  inputValue: string
}

export function useGeneralChatSocket(args: UseGeneralChatSocketArgs) {
  const { sessionId, selectedChat, setSessionId, setMessages, setSessions, inputValue } = args
  const { user, isAuthenticated } = useJWT()

  const [socketConnected, setSocketConnected] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const sessionIdRef = useRef<number | null>(null)
  const selectedChatRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)

  type NewGeneralMessagePayload = GeneralChatMessage & { session_id: number }
  type GeneralMessageSentPayload = { session_id: number }
  type TypingPayload = { userId: number }

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { selectedChatRef.current = selectedChat }, [selectedChat])

  // Socket setup
  useEffect(() => {
    if (!isAuthenticated) return
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return
    const socketUrl = baseUrl.replace(/\/?api\/?$/, '')

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined
    const authPayload = {
      token,
      firstName: user?.first_name,
      lastName: user?.last_name,
      profilePicture: user?.profile_picture,
    }

    const socket = io(`${socketUrl}/general-chat`, {
      transports: ["websocket"],
      auth: authPayload,
    })
    socketRef.current = socket

    const onConnect = () => setSocketConnected(true)
    const onDisconnect = () => setSocketConnected(false)
    const onConnectError = () => setSocketConnected(false)

    const onNewGeneralMessage = (messageData: NewGeneralMessagePayload) => {
      const incomingSessionId = messageData?.session_id
      if (!incomingSessionId) return

      if (!sessionIdRef.current && selectedChatRef.current) {
        // New session created from incoming message
        setSessionId(incomingSessionId)
        generalChatService.getMessages(incomingSessionId, 1, 50).then(msgs => {
          if (msgs.ok) setMessages(msgs.data.messages)
        })
        generalChatService.getSessions().then(r => {
          if (r.ok && Array.isArray(r.data)) setSessions(r.data)
        })
        return
      }

      if (incomingSessionId === sessionIdRef.current) {
        setMessages(prev => {
          // Replace temporary message if content matches
          const tempIndex = prev.findIndex(m => m.message_id < 0 && m.message === messageData.message)
          if (tempIndex >= 0) {
            const copy = [...prev]
            copy[tempIndex] = messageData
            return copy
          }
          // Avoid duplicate message_id
          const exists = prev.some(m => m.message_id === messageData.message_id)
          if (exists) return prev
          return [...prev, messageData]
        })
        generalChatService.getSessions().then(r => {
          if (r.ok && Array.isArray(r.data)) setSessions(r.data)
        })
      } else {
        // Update session list if message belongs to other session
        generalChatService.getSessions().then(r => {
          if (r.ok && Array.isArray(r.data)) setSessions(r.data)
        })
      }
    }

    const onGeneralMessageSent = (data: GeneralMessageSentPayload) => {
      const ackSessionId = data?.session_id
      if (!sessionIdRef.current && ackSessionId) {
        setSessionId(ackSessionId)
        generalChatService.getMessages(ackSessionId, 1, 50).then(msgs => {
          if (msgs.ok) setMessages(msgs.data.messages)
        })
        generalChatService.getSessions().then(r => {
          if (r.ok && Array.isArray(r.data)) setSessions(r.data)
        })
        return
      }
      if (sessionIdRef.current) {
        generalChatService.getMessages(sessionIdRef.current, 1, 50).then(msgs => {
          if (msgs.ok) setMessages(msgs.data.messages)
        })
      }
    }

    const onUserTyping = (data: TypingPayload) => {
      const otherUserId = data?.userId
      if (!otherUserId || otherUserId === Number(user?.id)) return
      setIsOtherTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = window.setTimeout(() => {
        setIsOtherTyping(false)
        typingTimeoutRef.current = null
      }, 2000)
    }

    const onUserStoppedTyping = (data: TypingPayload) => {
      const otherUserId = data?.userId
      if (!otherUserId || otherUserId === Number(user?.id)) return
      setIsOtherTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.on('new_general_message', onNewGeneralMessage)
    socket.on('new_message', onNewGeneralMessage)
    socket.on('general_message_sent', onGeneralMessageSent)
    socket.on('user_typing', onUserTyping)
    socket.on('user_stopped_typing', onUserStoppedTyping)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.off('new_general_message', onNewGeneralMessage)
      socket.off('new_message', onNewGeneralMessage)
      socket.off('general_message_sent', onGeneralMessageSent)
      socket.off('user_typing', onUserTyping)
      socket.off('user_stopped_typing', onUserStoppedTyping)
      socket.close()
      socketRef.current = null
      setSocketConnected(false)
    }
  }, [isAuthenticated, user?.first_name, user?.last_name, user?.profile_picture])

  // Join session room when available
  useEffect(() => {
    if (!socketRef.current || !socketConnected || !sessionId) return
    socketRef.current.emit('join_session', { sessionId })
  }, [socketConnected, sessionId])

  // Typing indicator emit
  useEffect(() => {
    if (!socketRef.current) return
    const socket = socketRef.current
    const sid = sessionId || undefined
    if (!selectedChatRef.current) return

    let stopTimer: number | undefined
    if (inputValue.trim()) {
      socket.emit('typing_start', { sessionId: sid })
      stopTimer = window.setTimeout(() => {
        socket.emit('typing_stop', { sessionId: sid })
      }, 1200)
    } else {
      socket.emit('typing_stop', { sessionId: sid })
    }
    return () => { if (stopTimer) clearTimeout(stopTimer) }
  }, [inputValue, sessionId])

  // Send message with optimistic update
  const sendMessage = async (payload: { message: string; sessionId?: number; ownerId?: number }) => {
    const text = payload.message.trim()
    if (!text) return
    const tempId = -Date.now()

    setMessages(prev => [
      ...prev,
      {
        message_id: tempId,
        session_id: payload.sessionId ?? 0,
        user_id: Number(user?.id) || 0,
        sender: 'user',
        message: text,
        attachment_url: null,
        attachment_filename: null,
        created_at: new Date().toISOString(),
      } as GeneralChatMessage,
    ])

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const canSocket = !!socketRef.current && baseUrl
    if (canSocket) {
      socketRef.current!.emit('send_general_message', {
        message: text,
        sessionId: payload.sessionId,
        ownerId: payload.ownerId,
      })
      return
    }

    const res = await generalChatService.sendMessage({
      message: text,
      sessionId: payload.sessionId,
      ownerId: payload.ownerId,
    })
    if (res.ok) {
      if (!payload.sessionId && res.data?.session?.session_id) {
        const newId = res.data.session.session_id
        setSessionId(newId)
      }
      generalChatService.getSessions().then(r => { if (r.ok && Array.isArray(r.data)) setSessions(r.data) })
      const sid = res.data?.session?.session_id ?? payload.sessionId
      if (sid) {
        const msgs = await generalChatService.getMessages(sid, 1, 50)
        if (msgs.ok) setMessages(msgs.data.messages)
      }
    }
  }

  return { socketConnected, sendMessage, isOtherTyping }
}

export default useGeneralChatSocket
