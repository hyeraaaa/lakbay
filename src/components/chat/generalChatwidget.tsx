"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Search, ChevronDown, Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generalChatService, type GeneralChatMessage, type GeneralChatSessionSummary } from "@/services/generalChatService"
import { useJWT } from "@/contexts/JWTContext"
import { useGeneralChat } from "@/hooks/general-chat/useGeneralChat"
import { useGeneralChatSocket } from "@/hooks/general-chat/useGeneralChatSocket"

export function GeneralChatWidget() {
  const { user, isAuthenticated } = useJWT()
  const isOwner = user?.user_type?.toLowerCase() === "owner"
  const {
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
    setMessages,
    inputValue,
    setInputValue,
    sessions,
    setSessions,
    isLoadingSessions,
    search,
    setSearch,
    messagesEndRef,
  } = useGeneralChat()

  const { socketConnected, sendMessage, isOtherTyping } = useGeneralChatSocket({
    sessionId,
    selectedChat,
    setSessionId,
    setMessages,
    setSessions,
    inputValue,
  })

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  const adjustTextAreaHeight = () => {
    const el = textAreaRef.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, 160) // cap max height ~10rem
    el.style.height = `${next}px`
  }

  useEffect(() => {
    adjustTextAreaHeight()
  }, [inputValue])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text) return
    const ownerNumericId = ownerId ? Number(ownerId) : undefined
    await sendMessage({
      message: text,
      sessionId: sessionId ?? undefined,
      ownerId: sessionId ? undefined : ownerNumericId,
    })
    setInputValue("")
  }

  const wrapMessage = (text: string, maxLen = 15) => {
    if (!text) return ''
    const chunks: string[] = []
    let i = 0
    while (i < text.length) {
      chunks.push(text.slice(i, i + maxLen))
      i += maxLen
    }
    return chunks.join('\n')
  }

  const truncatePreview = (text?: string, maxLen = 10) => {
    if (!text) return ''
    const trimmed = text
    return trimmed.length > maxLen ? trimmed.slice(0, maxLen) + '...' : trimmed
  }

  return (
    <>
      {/* Floating Chat Button - Only show for authenticated non-owners */}
      {isAuthenticated && !isOwner && (
        <div
          className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
            isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="hidden md:flex px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-105 border border-gray-300 cursor-pointer hover:bg-[#fafafc]"
            aria-label="Open chat"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </button>
        </div>
      )}

      {/* Shared Chat Window for Both Customers and Owners */}
      {isAuthenticated && (
      <div
        className={`fixed bottom-4 right-4 w-[95vw] h-[80vh] max-w-[700px] max-h-[600px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[600px] bg-card rounded-lg shadow-2xl flex flex-col z-50 border-2 border-border transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Chat</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Chat List */}
          <div className="w-[200px] sm:w-[250px] lg:w-[280px] border-r border-border flex flex-col">
            {/* Search and Filter */}
            <div className="p-3 bg-card">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name" className="pl-9 h-9 bg-muted border-border" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3 bg-muted border-border">
                      All
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All</DropdownMenuItem>
                    <DropdownMenuItem>Unread</DropdownMenuItem>
                    <DropdownMenuItem>Read</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingSessions ? (
                <div className="p-3 text-sm text-muted-foreground">Loading chats...</div>
              ) : sessions.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No chats yet</div>
              ) : (
                sessions
                  .filter(s => {
                    if (!search.trim()) return true
                    const name = `${s.other_user.first_name} ${s.other_user.last_name}`.toLowerCase()
                    return name.includes(search.trim().toLowerCase())
                  })
                .sort((a, b) => {
                  const aTime = new Date(a.last_message?.created_at ?? a.started_at).getTime()
                  const bTime = new Date(b.last_message?.created_at ?? b.started_at).getTime()
                  return bTime - aTime
                })
                  .map(s => (
                    <button
                      key={s.session_id}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition text-left ${sessionId === s.session_id ? 'bg-muted/60' : ''}`}
                      onClick={async () => {
                        setSelectedChat(String(s.other_user.user_id))
                        setOwnerId(String(s.other_user.user_id))
                        setSessionId(s.session_id)
                        // Load messages for this session
                        const msgs = await generalChatService.getMessages(s.session_id, 1, 50)
                        if (msgs.ok) setMessages(() => msgs.data.messages)
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        {s.other_user.profile_picture ? (
                          <AvatarImage src={s.other_user.profile_picture} alt="Profile" />
                        ) : null}
                        <AvatarFallback>
                          {(s.other_user.first_name?.[0] || 'U')}{(s.other_user.last_name?.[0] || 'N')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.other_user.first_name} {s.other_user.last_name}</div>
                        <div className="h-5 flex items-center">
                          {sessionId === s.session_id && isOtherTyping ? (
                            <div className="inline-flex items-center gap-1 text-black text-xs">
                              <span>Typing</span>
                              <div className="flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '300ms' }}></span>
                              </div>
                            </div>
                          ) : s.last_message ? (
                            <div className="text-xs text-muted-foreground truncate w-full">
                              {truncatePreview(`${s.last_message.user_id === Number(user?.id) ? 'You: ' : ''}${s.last_message.message}`, 10)}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">No messages yet</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Right Side - Chat Room */}
          <div className="flex-1 flex flex-col bg-muted/30">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-card border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {ownerProfile?.profile_picture ? (
                        <AvatarImage src={ownerProfile.profile_picture} alt="Owner profile" />
                      ) : null}
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {ownerProfile ? `${(ownerProfile.first_name || 'U')[0]}${(ownerProfile.last_name || 'N')[0]}` : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{ownerProfile ? `${ownerProfile.first_name} ${ownerProfile.last_name}` : isLoadingOwner ? 'Loading...' : 'User'}</h3>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((m) => {
                    const isUser = m.user_id === Number(user?.id)
                    const messageSender = m.users || (isUser ? null : ownerProfile ? {
                      user_id: ownerProfile.user_id,
                      first_name: ownerProfile.first_name || '',
                      last_name: ownerProfile.last_name || '',
                      profile_picture: ownerProfile.profile_picture || null,
                      user_type: ownerProfile.user_type
                    } : null)
                    return (
                      <div key={m.message_id} className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && messageSender && (
                          <Avatar className="h-8 w-8 mt-1">
                            {messageSender.profile_picture ? (
                              <AvatarImage src={messageSender.profile_picture} alt={`${messageSender.first_name} ${messageSender.last_name}`} />
                            ) : null}
                            <AvatarFallback>
                              {(messageSender.first_name?.[0] || 'U')}{(messageSender.last_name?.[0] || 'N')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          {wrapMessage(m.message)}
                        </div>
                      </div>
                    )
                  })}
                  {isOtherTyping && (
                    <div className="flex items-start gap-2 justify-start">
                      {ownerProfile && (
                        <Avatar className="h-8 w-8 mt-1">
                          {ownerProfile.profile_picture ? (
                            <AvatarImage src={ownerProfile.profile_picture} alt={`${ownerProfile.first_name} ${ownerProfile.last_name}`} />
                          ) : null}
                          <AvatarFallback>
                            {(ownerProfile.first_name?.[0] || 'U')}{(ownerProfile.last_name?.[0] || 'N')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="max-w-[75%] px-3 py-2 rounded-lg text-sm text-black">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-card border-t border-border">
                  <div className="flex items-center gap-2">
                    <textarea
                      ref={textAreaRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        adjustTextAreaHeight()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 min-h-[36px] max-h-40 overflow-y-auto resize-none px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleSend} disabled={!inputValue.trim()} size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Empty state when no chat selected
              <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                <div className="mb-6">
                  <svg
                    width="160"
                    height="120"
                    viewBox="0 0 160 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                  >
                    {/* Laptop */}
                    <rect
                      x="20"
                      y="20"
                      width="120"
                      height="80"
                      rx="4"
                      fill="#E5E7EB"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                    />
                    <rect x="30" y="30" width="100" height="60" fill="white" />

                    {/* Blue Chat Bubble */}
                    <rect x="45" y="45" width="50" height="20" rx="4" fill="#3B82F6" />
                    <rect x="50" y="50" width="30" height="3" rx="1.5" fill="white" />
                    <rect x="50" y="57" width="20" height="3" rx="1.5" fill="white" />

                    {/* Red Chat Bubble */}
                    <rect x="110" y="55" width="40" height="30" rx="6" fill="#EF4444" />
                    <circle cx="120" cy="67" r="2" fill="white" />
                    <circle cx="128" cy="67" r="2" fill="white" />
                    <circle cx="136" cy="67" r="2" fill="white" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to Lakbay Chat</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwner ? 'Start chatting with customers now!' : 'Start chatting with car owners now!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </>
  )
}

export default GeneralChatWidget
export { GeneralChatWidget as generalChatWidget }
