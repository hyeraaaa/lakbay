"use client"

import type React from "react"
import { chatService, type ChatSession } from "@/services/chatService"
import type { Dispatch, SetStateAction } from "react"
import { Socket } from "socket.io-client"

type UiMessage = {
  text: string
  isUser: boolean
  sender: 'user' | 'ai' | 'admin'
  isTyping?: boolean
}

type MessagesSetter = Dispatch<SetStateAction<UiMessage[]>>
type SessionSetter = Dispatch<SetStateAction<ChatSession | null>>

export function useAiChatActions(params: {
  inputValue: string
  setInputValue: (v: string) => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
  errorSetter: (v: string) => void
  messagesSetter: MessagesSetter
  currentSession: ChatSession | null
  setCurrentSession: SessionSetter
  socketRef: React.MutableRefObject<Socket | null>
  isSocketConnected: boolean
}) {
  const {
    inputValue,
    setInputValue,
    isLoading,
    setIsLoading,
    errorSetter,
    messagesSetter,
    currentSession,
    setCurrentSession,
    socketRef,
    isSocketConnected,
  } = params

  const initializeChatSession = async () => {
    try {
      setIsLoading(true)
      errorSetter("")
      if (socketRef.current && isSocketConnected) {
        socketRef.current.emit('create_session')
      }
    } catch (err) {
      errorSetter("Failed to connect to chat service")
      console.error("Chat initialization error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    if (inputValue.trim() === '/help') {
      setInputValue("")
      messagesSetter((prev: UiMessage[]) => [...prev, { text: "Commands: /admin – escalate to human | /help – show this list", isUser: false, sender: 'ai' as const }])
      return
    }

    if (inputValue.trim() === '/admin') {
      setInputValue("")
      await handleEscalateToAdmin()
      return
    }

    if (!currentSession || currentSession.status === 'ended') {
      try {
        const sessionRes = await chatService.getOrCreateChatSession()
        if (sessionRes.ok && sessionRes.data?.session) {
          const session = sessionRes.data.session
          setCurrentSession(() => session)
          if (typeof window !== 'undefined' && session) {
            localStorage.setItem('lakbay_chat_session_id', String(session.session_id))
          }
          if (socketRef.current && isSocketConnected && session) {
            socketRef.current.emit('join_session', { sessionId: session.session_id })
          }
        } else {
          errorSetter(sessionRes.message || 'Failed to create new chat session. Please try again.')
          return
        }
      } catch (err) {
        errorSetter('Failed to create new chat session. Please try again.')
        return
      }
    }

    const userMessage = inputValue.trim()
    setInputValue("")

    messagesSetter((prev: UiMessage[]) => {
      const base = [...prev, { text: userMessage, isUser: true, sender: 'user' as const }]
      if (currentSession?.status !== 'admin_handling') {
        return [...base, { text: 'AI is thinking...', isUser: false, sender: 'ai' as const, isTyping: true }]
      }
      return base
    })

    try {
      setIsLoading(true)
      errorSetter("")
      if (!socketRef.current || !isSocketConnected) throw new Error('Socket not connected')
      const activeSessionId = currentSession?.session_id
      if (!activeSessionId) {
        throw new Error('No active session')
      }
      socketRef.current.emit('send_message', {
        message: userMessage,
        sessionId: activeSessionId
      })
    } catch (err) {
      console.error("Send message error:", err)
      errorSetter("Failed to send message")
      messagesSetter((prev: UiMessage[]) => prev.filter((msg: UiMessage) => !msg.isTyping))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEscalateToAdmin = async () => {
    try {
      setIsLoading(true)
      errorSetter("")

      let session = currentSession
      if (!session || session.status === 'ended') {
        const res = await chatService.getOrCreateChatSession()
        if (res.ok && res.data?.session) {
          session = res.data.session
          setCurrentSession(() => session)
          if (typeof window !== 'undefined' && session) {
            localStorage.setItem('lakbay_chat_session_id', String(session.session_id))
          }
          if (socketRef.current && isSocketConnected && session) {
            socketRef.current.emit('join_session', { sessionId: session.session_id })
          }
        } else {
          throw new Error(res.message || 'Unable to get or create session')
        }
      }

      messagesSetter((prev: UiMessage[]) => [...prev, { text: 'Escalating to a human admin...', isUser: false, sender: 'admin' }])

      if (socketRef.current && isSocketConnected) {
        socketRef.current.emit('escalate_to_admin', { sessionId: session.session_id })
      } else {
        const res = await chatService.escalateToAdmin(session.session_id)
        if (res.ok) {
          setCurrentSession((prev: ChatSession | null) => prev ? { ...prev, status: 'admin_handling', escalated_at: res.data?.escalated_at || new Date().toISOString() } : prev)
          messagesSetter((prev: UiMessage[]) => [...prev, { text: 'Your chat has been escalated to a human admin. Please wait for their response.', isUser: false, sender: 'admin' }])
        } else {
          throw new Error(res.message || 'Failed to escalate to admin')
        }
      }
    } catch (err) {
      errorSetter('Failed to escalate to admin')
      console.error('Escalation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!currentSession) return
    try {
      setIsLoading(true)
      const response = await chatService.endSession(currentSession.session_id)
      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lakbay_chat_session_id')
        }
        messagesSetter((prev: UiMessage[]) => [...prev, {
          text: "Chat session ended. Thank you for contacting us!",
          isUser: false,
          sender: currentSession.status === 'admin_handling' ? 'admin' : 'ai'
        }])
        setCurrentSession((prev: ChatSession | null) => prev ? { ...prev, status: 'ended' } : null)
        try {
          const sessionRes = await chatService.getOrCreateChatSession()
          if (sessionRes.ok && sessionRes.data?.session) {
            const session = sessionRes.data.session
            setCurrentSession(() => session)
            if (typeof window !== 'undefined' && session) {
              localStorage.setItem('lakbay_chat_session_id', String(session.session_id))
            }
            if (socketRef.current && isSocketConnected && session) {
              socketRef.current.emit('join_session', { sessionId: session.session_id })
            }
            messagesSetter((prev: UiMessage[]) => [...prev, { text: 'New chat started. How can I help you?', isUser: false, sender: 'ai' }])
          } else {
            errorSetter(sessionRes.message || 'Failed to start a new chat session')
          }
        } catch (err) {
          errorSetter('Failed to start a new chat session')
        }
      } else {
        errorSetter(response.message || "Failed to end session")
      }
    } catch (err) {
      errorSetter("Failed to end session")
      console.error("End session error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    initializeChatSession,
    handleSendMessage,
    handleKeyPress,
    handleEscalateToAdmin,
    handleEndSession,
  }
}








