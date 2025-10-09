"use client"

import Link from "next/link"
import { use, useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Paperclip, Send } from "lucide-react"
import { useGeneralChat } from "@/hooks/general-chat/useGeneralChat"
import { useGeneralChatSocket } from "@/hooks/general-chat/useGeneralChatSocket"
import { generalChatService } from "@/services/generalChatService"
import { useJWT } from "@/contexts/JWTContext"

const ChatRoomPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const {
    sessions,
    sessionId,
    setSessionId,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    setSessions,
    messagesEndRef,
  } = useGeneralChat()
  const { user } = useJWT()

  const numericId = useMemo(() => {
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  useEffect(() => {
    let active = true
    const init = async () => {
      if (!numericId) return
      if (sessionId !== numericId) setSessionId(numericId)
      const res = await generalChatService.getMessages(numericId, 1, 50)
      if (active && res.ok) setMessages(() => res.data.messages)
    }
    init()
    return () => {
      active = false
    }
  }, [numericId, sessionId, setSessionId, setMessages])

  const peer = useMemo(() => {
    const s = sessions.find((ss) => ss.session_id === (numericId || sessionId || -1))
    return s?.other_user
  }, [sessions, numericId, sessionId])

  const name = peer ? `${peer.first_name} ${peer.last_name}`.trim() : "Conversation"
  const avatar = peer?.profile_picture || "/placeholder.svg"
  const initials = useMemo(
    () => name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    [name]
  )

  const { sendMessage, isOtherTyping } = useGeneralChatSocket({
    sessionId: numericId || sessionId,
    selectedChat: "session",
    setSessionId,
    setMessages,
    setSessions,
    inputValue,
  })

  // Scroll behavior control
  const initialLoad = useRef(true)

  useEffect(() => {
    if (!messages.length) return
    if (initialLoad.current) {
      initialLoad.current = false
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" })
      })
    } else {
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
    }
  }, [messages.length, isOtherTyping])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    await sendMessage({ message: inputValue, sessionId: numericId || sessionId || undefined })
    setInputValue("")
  }

  return (
    <div className="flex max-w-xl my-auto mx-auto min-h-[100dvh] max-h-[100dvh] md:min-h-[89vh] md:max-h-[89vh] flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to chats</span>
          </Button>
        </Link>

        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground">{isOtherTyping ? "Typing..." : ""}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m) => {
          const isUser = m.user_id === Number(user?.id)
          return (
            <div key={m.message_id} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={peer?.profile_picture || "/placeholder.svg"} alt={peer?.first_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {peer?.first_name?.[0]?.toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[60%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words ${
                  isUser
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-foreground mr-auto"
                }`}
              >
                {m.message}
              </div>
            </div>
          )
        })}

        {isOtherTyping && (
          <div className="flex justify-start items-end gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={peer?.profile_picture || "/placeholder.svg"} alt={peer?.first_name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {peer?.first_name?.[0]?.toUpperCase() || ""}
              </AvatarFallback>
            </Avatar>

            <div className="max-w-[75%] px-3 py-2 rounded-lg text-sm bg-muted text-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <form className="flex items-end gap-2" onSubmit={onSubmit}>
          <Button type="button" variant="ghost" size="icon" className="rounded-full shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[36px] max-h-40 overflow-y-auto resize-none px-3 py-2 rounded-md border border-border bg-background text-foreground text-[16px] focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="rounded-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoomPage
