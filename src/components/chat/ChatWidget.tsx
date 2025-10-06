"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useJWT } from "@/contexts/JWTContext"
import { useAiChatSocket } from "@/hooks/ai-chat/useAiChatSocket"
import { useAiChatActions } from "@/hooks/ai-chat/useAiChatActions"
import { useAutoScroll } from "@/hooks/ai-chat/useAutoScroll"

export default function ChatWidget() {
  const { user, isAuthenticated } = useJWT()
  const searchParams = useSearchParams()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)

  const {
    messages,
    setMessages,
    currentSession,
    setCurrentSession,
    isSocketConnected,
    socketRef,
    error,
    setError,
  } = useAiChatSocket(isAuthenticated, user)

  useAutoScroll(messages, isChatOpen, messagesEndRef)

  // Auto-open chat when openChat=true URL parameter is present
  useEffect(() => {
    const openChat = searchParams.get('openChat')
    if (openChat === 'true' && isAuthenticated) {
      setIsChatOpen(true)
    }
  }, [searchParams, isAuthenticated])

  const {
    initializeChatSession,
    handleSendMessage,
    handleKeyPress,
    handleEscalateToAdmin,
    handleEndSession,
  } = useAiChatActions({
    inputValue,
    setInputValue,
    isLoading,
    setIsLoading,
    errorSetter: setError,
    messagesSetter: setMessages,
    currentSession,
    setCurrentSession,
    socketRef,
    isSocketConnected,
  })

  // Don't show chat widget if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Chat Icon - Fixed position in bottom right */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-50 ${
          isChatOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Box */}
      <div
        className={`fixed bottom-6 right-6 w-80 h-[400px] sm:w-96 sm:h-[500px] bg-card border border-border rounded-lg shadow-xl transition-all duration-300 flex flex-col z-50 ${
          isChatOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
           <div className="flex flex-col">
             <h3 className="font-semibold text-foreground">
               {currentSession?.status === 'admin_handling' 
                 ? 'Admin Support' 
                 : currentSession?.status === 'ended'
                 ? 'Chat Ended'
                 : 'Lakbay Bot'}
             </h3>
             {currentSession?.status === 'ended' && (
               <p className="text-xs text-muted-foreground">
                 Start a new conversation below
               </p>
             )}
           </div>
          <Button onClick={() => setIsChatOpen(false)} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Messages Area */}
        <div className="p-4 space-y-3 overflow-y-auto h-64 sm:h-80">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Connecting...</span>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!message.isUser && (
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage
                        src="/logo.png"
                        alt={message.sender === 'admin' ? 'Admin' : 'AI Assistant'}
                      />
                      <AvatarFallback>{message.sender === 'admin' ? 'A' : 'AI'}</AvatarFallback>
                    </Avatar>
                  )}
                <div className="flex flex-col max-w-xs sm:max-w-sm">
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      message.isUser 
                        ? "bg-primary text-primary-foreground" 
                        : message.sender === 'admin'
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

         {/* Input Area */}
         <div className="p-4 my-auto border-t border-border">
           {currentSession?.status === 'admin_handling' && (
             <div className="mb-2 text-xs text-blue-600 dark:text-blue-400">
               Chat escalated to human admin
             </div>
           )}
           
           {currentSession?.status === 'ended' && (
             <div className="mb-2 text-xs text-green-600 dark:text-green-400">
               Previous session ended. Start a new conversation below.
             </div>
           )}
           
           
           <div className="flex gap-2">
             <Input
               value={inputValue}
               onChange={(e) => {
                 setInputValue(e.target.value)
                 if (socketRef.current && isSocketConnected && currentSession?.status === 'admin_handling' && currentSession?.session_id) {
                   socketRef.current.emit('typing_start', { sessionId: currentSession.session_id })
                   if (typingTimeoutRef.current) {
                     window.clearTimeout(typingTimeoutRef.current)
                   }
                   typingTimeoutRef.current = window.setTimeout(() => {
                     if (socketRef.current && isSocketConnected) {
                       socketRef.current.emit('typing_stop', { sessionId: currentSession.session_id })
                     }
                   }, 1000)
                 }
               }}
               onKeyPress={handleKeyPress}
               onBlur={() => {
                 if (typingTimeoutRef.current) {
                   window.clearTimeout(typingTimeoutRef.current)
                   typingTimeoutRef.current = null
                 }
                 if (socketRef.current && isSocketConnected && currentSession?.status === 'admin_handling' && currentSession?.session_id) {
                   socketRef.current.emit('typing_stop', { sessionId: currentSession.session_id })
                 }
               }}
               placeholder={
                 currentSession?.status === 'admin_handling' 
                   ? "Message admin..." 
                   : currentSession?.status === 'ended'
                   ? "Start a new conversation..."
                   : "Ask me anything about Lakbay... (type /admin for human help)"
               }
               className="flex-1"
               disabled={isLoading}
             />
             <Button 
               onClick={handleSendMessage} 
               size="icon" 
               disabled={isLoading || !inputValue.trim()}
             >
               {isLoading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Send className="h-4 w-4" />
               )}
             </Button>
           </div>
        </div>
      </div>
    </>
  )
}
