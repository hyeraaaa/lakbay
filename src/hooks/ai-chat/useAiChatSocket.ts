"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { chatService, type ChatSession, type ChatMessage, type ChatSessionMessagesResponse } from "@/services/chatService"

type Sender = 'user' | 'ai' | 'admin'
export type UiMessage = { text: string; isUser: boolean; sender: Sender; isTyping?: boolean }

// Socket event payload types
interface SessionCreatedPayload {
  session: ChatSession;
  welcomeMessage?: ChatMessage;
}

interface NewMessagePayload {
  message: string;
  sender: Sender;
  sessionId: number;
}

interface AdminMessagePayload {
  message: string;
  sessionId: number;
}

interface TypingPayload {
  sessionId: number;
  isTyping: boolean;
}

interface SessionEscalatedPayload {
  sessionId: number;
  escalatedAt: string;
}

interface SessionEndedPayload {
  sessionId: number;
}

interface SocketErrorPayload {
  message?: string;
  code?: string;
}

export function useAiChatSocket(
  isAuthenticated: boolean,
  user: { id?: number | string; first_name?: string; last_name?: string; profile_picture?: string } | null
) {
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [error, setError] = useState<string>("")
  const [isAdminTyping, setIsAdminTyping] = useState<boolean>(false)
  const socketRef = useRef<Socket | null>(null)
  const currentSessionRef = useRef<ChatSession | null>(null)
  const lastAiMessageAtRef = useRef<number>(0)

  useEffect(() => {
    currentSessionRef.current = currentSession
  }, [currentSession])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined

    const socket = io(`${baseUrl}/ai-chat`, {
      transports: ["websocket"],
      auth: {
        token,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
      }
    })

    socketRef.current = socket

    const onConnect = async () => {
      setIsSocketConnected(true)
      try {
        const lastSessionIdStr = typeof window !== 'undefined' ? localStorage.getItem('lakbay_chat_session_id') : null
        if (lastSessionIdStr) {
          const lastSessionId = parseInt(lastSessionIdStr, 10)
          if (!Number.isNaN(lastSessionId)) {
            const msgsRes = await chatService.getSessionWithMessages(lastSessionId)
            if (msgsRes.ok && msgsRes.data?.session) {
              const sessionData = msgsRes.data.session
              const isEnded = sessionData.status === 'ended'
              if (!isEnded) {
                // We need to get the full session data since this is only partial
                const fullSessionRes = await chatService.getOrCreateChatSession()
                if (fullSessionRes.ok && fullSessionRes.data?.session) {
                  setCurrentSession(fullSessionRes.data.session)
                  const mapped = (msgsRes.data.messages || []).map((m: ChatMessage) => ({ text: m.message, isUser: m.sender === 'user', sender: m.sender }))
                  setMessages(mapped)
                  socket.emit('join_session', { sessionId: fullSessionRes.data.session.session_id })
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('lakbay_chat_session_id', String(fullSessionRes.data.session.session_id))
                  }
                  return
                }
              } else {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('lakbay_chat_session_id')
                }
              }
            }
          }
        }

        const sessionRes = await chatService.getOrCreateChatSession()
        if (sessionRes.ok && sessionRes.data?.session) {
          const session = sessionRes.data.session
          setCurrentSession(session)
          if (typeof window !== 'undefined') {
            localStorage.setItem('lakbay_chat_session_id', String(session.session_id))
          }
          socket.emit('join_session', { sessionId: session.session_id })
          const msgsRes = await chatService.getSessionWithMessages(session.session_id)
          if (msgsRes.ok && Array.isArray(msgsRes.data?.messages)) {
            const mapped = msgsRes.data.messages.map((m: ChatMessage) => ({ text: m.message, isUser: m.sender === 'user', sender: m.sender }))
            setMessages(mapped)
          } else {
            setMessages([])
          }
        }
      } catch (e) {
        setError('Failed to restore chat. Please try again shortly.')
      }
    }
    const onDisconnect = () => setIsSocketConnected(false)

    const onSessionCreated = (payload: SessionCreatedPayload) => {
      setCurrentSession(payload.session)
      if (typeof window !== 'undefined') {
        localStorage.setItem('lakbay_chat_session_id', String(payload.session.session_id))
      }
      setMessages(prev => {
        const hasAny = prev.length > 0
        if (hasAny) return prev
        if (payload.welcomeMessage) {
          return [...prev, { text: payload.welcomeMessage.message, isUser: false, sender: 'ai' as const }]
        }
        return prev
      })
    }

    const onNewMessage = (msg: NewMessagePayload) => {
      if (msg?.sender === 'user') return
      if (msg?.sender === 'ai') {
        lastAiMessageAtRef.current = Date.now()
      }
      setMessages(prev => [...prev.filter(m => !m.isTyping), {
        text: msg.message,
        isUser: false,
        sender: msg.sender
      }])
    }

    const onAdminMessage = (msg: AdminMessagePayload) => {
      // Any admin message should remove admin typing bubble
      setIsAdminTyping(false)
      setMessages(prev => [...prev.filter(m => !(m.isTyping && m.sender === 'admin')), {
        text: msg.message,
        isUser: false,
        sender: 'admin'
      }])
    }

    const onAiTyping = (data: TypingPayload) => {
      const active = currentSessionRef.current
      if (!active || data.sessionId !== active.session_id) return
      if (active.status === 'ended' || active.status === 'admin_handling') return
      if (data.isTyping) {
        const elapsed = Date.now() - (lastAiMessageAtRef.current || 0)
        if (elapsed < 750) {
          return
        }
      }
      if (data.isTyping) {
        setMessages(prev => {
          const hasTyping = prev.some(m => m.isTyping)
          return hasTyping ? prev : [...prev, { text: '', isUser: false, sender: 'ai' as const, isTyping: true }]
        })
      } else {
        setMessages(prev => prev.filter(m => !m.isTyping))
      }
    }

    const onSessionEscalated = (data: SessionEscalatedPayload) => {
      setCurrentSession(prev => prev ? { ...prev, status: 'admin_handling', escalated_at: data.escalatedAt } : prev)
      setMessages(prev => [...prev, {
        text: "I understand you'd like to speak with a human support representative. I'm now connecting you with one of our admin team members who will be able to assist you further. Please wait a moment while I transfer your conversation.",
        isUser: false,
        sender: 'ai'
      }])
    }

    const onAdminTyping = (data: TypingPayload) => {
      const active = currentSessionRef.current
      if (!active || data.sessionId !== active.session_id) return
      if (active.status !== 'admin_handling') return
      setIsAdminTyping(Boolean(data.isTyping))
      if (data.isTyping) {
        setMessages(prev => {
          const hasTyping = prev.some(m => m.isTyping && m.sender === 'admin')
          return hasTyping ? prev : [...prev, { text: '', isUser: false, sender: 'admin' as const, isTyping: true }]
        })
      } else {
        setMessages(prev => prev.filter(m => !(m.isTyping && m.sender === 'admin')))
      }
    }

    const onSocketError = async (payload: SocketErrorPayload) => {
      const message = payload?.message || ''
      if (typeof message === 'string' && message.toLowerCase().includes('invalid chat session')) {
        setCurrentSession(prev => prev ? { ...prev, status: 'ended' } : prev)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lakbay_chat_session_id')
        }
        setMessages(prev => [...prev, { text: 'Previous chat ended. Starting a new conversation...', isUser: false, sender: 'ai' }])
        try {
          const sessionRes = await chatService.getOrCreateChatSession()
          if (sessionRes.ok && sessionRes.data?.session) {
            const session = sessionRes.data.session
            setCurrentSession(session)
            if (typeof window !== 'undefined') {
              localStorage.setItem('lakbay_chat_session_id', String(session.session_id))
            }
            socket.emit('join_session', { sessionId: session.session_id })
          }
        } catch (err) {
          // noop
        }
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('session_created', onSessionCreated)
    socket.on('session_joined', () => {})
    socket.on('new_message', onNewMessage)
    socket.on('admin_message', onAdminMessage)
    socket.on('ai_typing', onAiTyping)
    socket.on('session_escalated', onSessionEscalated)
    socket.on('admin_typing', onAdminTyping)
    socket.on('session_ended', async (payload: SessionEndedPayload) => {
      const endedId = payload?.sessionId
      const active = currentSessionRef.current
      if (active && endedId === active.session_id) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lakbay_chat_session_id')
        }
        // Clear any typing indicators/placeholders when session ends
        setIsAdminTyping(false)
        setMessages(prev => prev.filter(m => !m.isTyping))
        setCurrentSession(prev => prev ? { ...prev, status: 'ended' } : prev)
        setMessages(prev => [...prev, {
          text: 'Chat session ended. Thank you for contacting us!',
          isUser: false,
          sender: 'admin'
        }])

        try {
          const sessionRes = await chatService.getOrCreateChatSession()
          if (sessionRes.ok && sessionRes.data?.session) {
            const session = sessionRes.data.session
            setCurrentSession(session)
            if (typeof window !== 'undefined') {
              localStorage.setItem('lakbay_chat_session_id', String(session.session_id))
            }
            socket.emit('join_session', { sessionId: session.session_id })
            // Ensure no typing placeholders carry over
            setIsAdminTyping(false)
            setMessages(prev => [...prev.filter(m => !m.isTyping), { text: 'Hello I\'m Lakbay\'s AI chatbot. How can I help you?', isUser: false, sender: 'ai' }])
          } else {
            setError(sessionRes.message || 'Failed to start a new chat session')
          }
        } catch (err) {
          setError('Failed to start a new chat session')
        }
      }
    })
    socket.on('error', onSocketError)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('session_created', onSessionCreated)
      socket.off('new_message', onNewMessage)
      socket.off('admin_message', onAdminMessage)
      socket.off('ai_typing', onAiTyping)
      socket.off('session_escalated', onSessionEscalated)
      socket.off('admin_typing', onAdminTyping)
      socket.off('session_ended')
      socket.off('session_joined')
      socket.off('error', onSocketError)
      socket.close()
      socketRef.current = null
    }
  }, [isAuthenticated, user?.id, user?.first_name, user?.last_name, user?.profile_picture])

  return {
    messages,
    setMessages,
    currentSession,
    setCurrentSession,
    isSocketConnected,
    socketRef,
    error,
    setError,
    currentSessionRef,
    lastAiMessageAtRef,
  }
}


