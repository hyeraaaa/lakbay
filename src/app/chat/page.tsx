"use client"

import Link from "next/link"
import { useMemo } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useGeneralChat } from "@/hooks/general-chat/useGeneralChat"
import { useGeneralChatSocket } from "@/hooks/general-chat/useGeneralChatSocket"
import { useJWT } from "@/contexts/JWTContext"

const ChatsPage = () => {
  const {
    sessions,
    isLoadingSessions,
    search,
    setSearch,
    sessionId,
    setSessionId,
    setMessages,
    setSessions,
    inputValue,
  } = useGeneralChat()
  const { user } = useJWT()

  // Initialize socket to keep sessions list in sync in real-time
  useGeneralChatSocket({
    sessionId,
    selectedChat: null,
    setSessionId,
    setMessages,
    setSessions,
    inputValue,
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter((s) => {
      const name = `${s.other_user.first_name} ${s.other_user.last_name}`.toLowerCase()
      const last = s.last_message?.message?.toLowerCase() ?? ""
      return name.includes(q) || last.includes(q)
    })
  }, [sessions, search])

  return (
    <div className="flex min-h-[100dvh] max-h-[100dvh] md:min-h-[89vh] md:max-h-[89vh] flex-col bg-background max-w-xl my-auto mx-auto border border-border">
      {/* Header */}
      <header className="flex justify-start align-center gap-2 border-b border-border bg-card px-4 py-3">
        <Image src="/logo.png" alt="Lakbay" width={28} height={28} className="h-8 w-auto" priority />
        <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
      </header>

      {/* Search */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-10 bg-secondary border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingSessions && (
          <div className="px-4 py-3 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoadingSessions && filtered.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground">No conversations found</div>
        )}
        {filtered.map((s) => {
          const name = `${s.other_user.first_name} ${s.other_user.last_name}`.trim()
          const avatar = s.other_user.profile_picture || "/placeholder.svg"
          const lastMessage = s.last_message?.message || ""
          const initials = name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()

          // Determine who sent the last message
          const isYou = s.last_message?.user_id === Number(user?.id)

          // Format timestamp
          const createdAt = s.last_message ? new Date(s.last_message.created_at) : null
          let displayTime = ""
          if (createdAt) {
            const now = new Date()
            const diffMs = now.getTime() - createdAt.getTime()
            const diffHours = diffMs / (1000 * 60 * 60)

            if (diffHours < 24) {
              displayTime = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            } else {
              displayTime = createdAt.toLocaleDateString([], { weekday: "short" })
            }
          }

          return (
            <Link
              key={s.session_id}
              href={`/chat/${s.session_id}`}
              className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{name}</h3>
                  <span className="text-xs text-muted-foreground">{displayTime}</span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {isYou ? (
                    <span className="text-primary font-medium">You: </span>
                  ) : null}
                  {lastMessage}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ChatsPage
