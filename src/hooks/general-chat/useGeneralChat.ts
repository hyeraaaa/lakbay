"use client"

import { useEffect, useRef, useState } from "react"
import { profileService, type UserProfileResponse } from "@/services/profileServices"
import { generalChatService, type GeneralChatMessage, type GeneralChatSessionSummary } from "@/services/generalChatService"
import { useJWT } from "@/contexts/JWTContext"

export type UseGeneralChatState = {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  selectedChat: string | null
  setSelectedChat: (v: string | null) => void
  ownerId: string | null
  setOwnerId: (v: string | null) => void
  ownerProfile: UserProfileResponse | null
  isLoadingOwner: boolean
  sessionId: number | null
  setSessionId: (v: number | null) => void
  messages: GeneralChatMessage[]
  setMessages: (updater: ((prev: GeneralChatMessage[]) => GeneralChatMessage[]) | GeneralChatMessage[]) => void
  inputValue: string
  setInputValue: (v: string) => void
  sessions: GeneralChatSessionSummary[]
  setSessions: (v: GeneralChatSessionSummary[]) => void
  isLoadingSessions: boolean
  search: string
  setSearch: (v: string) => void
  messagesEndRef: React.MutableRefObject<HTMLDivElement | null>
}

export function useGeneralChat(): UseGeneralChatState {
  const { user, isAuthenticated } = useJWT()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<UserProfileResponse | null>(null)
  const [isLoadingOwner, setIsLoadingOwner] = useState<boolean>(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [messages, setMessages] = useState<GeneralChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [sessions, setSessions] = useState<GeneralChatSessionSummary[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false)
  const [search, setSearch] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Broadcast open/close state so other components (e.g., navbar) can react
  useEffect(() => {
    try {
      const evt = new CustomEvent('lakbay:general-chat-open-state', { detail: { isOpen } })
      window.dispatchEvent(evt)
    } catch {}
  }, [isOpen])

  // Handle external event to open chat with a specific owner
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ ownerId: string }>
      if (!custom?.detail?.ownerId) return
      const id = custom.detail.ownerId
      setOwnerId(id)
      setIsOpen(true)
      setSelectedChat(id)
    }
    
    // Handle owner opening their chat (different from customer opening chat with owner)
    const ownerHandler = (e: Event) => {
      if (user?.user_type?.toLowerCase() === 'owner') {
        setOwnerId(null) // Don't set ownerId for owners
        setIsOpen(true)
        setSelectedChat(null) // Will show the session list
      }
    }
    
    window.addEventListener('lakbay:open-chat-with-owner', handler as EventListener)
    window.addEventListener('lakbay:open-owner-chat', ownerHandler as EventListener)
    
    return () => {
      window.removeEventListener('lakbay:open-chat-with-owner', handler as EventListener)
      window.removeEventListener('lakbay:open-owner-chat', ownerHandler as EventListener)
    }
  }, [user?.user_type])

  // Load owner profile whenever ownerId changes
  useEffect(() => {
    let active = true
    const run = async () => {
      if (!ownerId) return
      setIsLoadingOwner(true)
      try {
        const { ok, data } = await profileService.getPublicProfile(ownerId)
        if (active) setOwnerProfile(ok ? data : null)
      } catch {
        if (active) setOwnerProfile(null)
      } finally {
        if (active) setIsLoadingOwner(false)
      }
    }
    setOwnerProfile(null)
    run()
    return () => { active = false }
  }, [ownerId])

  // Load existing session and messages for this owner (if any) when ownerId is set
  useEffect(() => {
    let active = true
    const load = async () => {
      if (!ownerId || !isAuthenticated) return
      try {
        const ownerNumericId = Number(ownerId)
        if (Number.isNaN(ownerNumericId)) return
        const res = await generalChatService.checkOrGetExistingSessionWithOwner(ownerNumericId)
        if (active && res.ok && res.data?.session_id) {
          setSessionId(res.data.session_id)
          const msgs = await generalChatService.getMessages(res.data.session_id, 1, 50)
          if (msgs.ok) setMessages(msgs.data.messages)
        } else if (active) {
          setSessionId(null)
          setMessages([])
        }
      } catch {
        if (active) {
          setSessionId(null)
          setMessages([])
        }
      }
    }
    load()
    return () => { active = false }
  }, [ownerId, isAuthenticated])

  // Fetch the user's general chat sessions (for left list)
  useEffect(() => {
    let active = true
    const loadSessions = async () => {
      if (!isAuthenticated) return
      setIsLoadingSessions(true)
      try {
        const res = await generalChatService.getSessions()
        if (active && res.ok && Array.isArray(res.data)) {
          setSessions(res.data)
        }
      } finally {
        if (active) setIsLoadingSessions(false)
      }
    }
    loadSessions()
    return () => { active = false }
  }, [isAuthenticated, isOpen])

  // Auto-scroll to latest message when messages change or chat opens
  useEffect(() => {
    if (!isOpen) return
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isOpen, selectedChat])

  return {
    isOpen,
    setIsOpen,
    selectedChat,
    setSelectedChat,
    ownerId,
    setOwnerId,
    ownerProfile,
    isLoadingOwner,
    sessionId,
    setSessionId,
    messages,
    setMessages: (updater) => {
      setMessages(prev => typeof updater === 'function' ? (updater as (p: GeneralChatMessage[]) => GeneralChatMessage[])(prev) : updater as GeneralChatMessage[])
    },
    inputValue,
    setInputValue,
    sessions,
    setSessions,
    isLoadingSessions,
    search,
    setSearch,
    messagesEndRef,
  }
}

export default useGeneralChat


