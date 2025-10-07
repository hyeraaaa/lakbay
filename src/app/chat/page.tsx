"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGeneralChat } from "@/hooks/general-chat/useGeneralChat"
import { useGeneralChatSocket } from "@/hooks/general-chat/useGeneralChatSocket"

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
    <div className="flex min-h-[80vh] max-h-[80vh] flex-col bg-background max-w-xl my-auto mx-auto border border-border rounded-lg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Edit className="h-5 w-5" />
            <span className="sr-only">New message</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
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
          <div className="px-4 py-3 text-sm text-muted-foreground">Loading sessions...</div>
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
                <span className="text-xs text-muted-foreground">
                  {s.last_message ? new Date(s.last_message.created_at).toLocaleString() : ""}
                </span>
              </div>
              <p className="truncate text-sm text-muted-foreground">{lastMessage}</p>
            </div>
          </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ChatsPage;
