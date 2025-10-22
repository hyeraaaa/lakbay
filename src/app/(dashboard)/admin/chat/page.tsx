"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAdminChat } from "@/hooks/admin-chat"
import { MessageCircle, Users, Clock, Send, X, Wifi, WifiOff } from "lucide-react"

const AdminChatPage: React.FC = () => {
  const {
    user,
    selectedSessionId,
    setSelectedSessionId,
    adminInput,
    setAdminInput,
    escalations,
    connected,
    messages,
    isLoadingMessages,
    messagesContainerRef,
    messagesEndRef,
    handleSendAdminMessage,
    handleKeyDown,
    isUserTyping,
  } = useAdminChat()

  return (
    <div className="h-[calc(100vh-100px)]">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Left: Escalations list */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-slate-100">Escalations</span>
              <Badge variant="secondary" className="ml-auto">
                {escalations.length}
              </Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {escalations.length === 0 ? (
              <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                <MessageCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No escalations yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">New escalations will appear here</p>
              </div>
            ) : (
              <div className="p-2">
                {escalations.map((e, idx) => {
                  const isActive = selectedSessionId === e.session_id
                  return (
                    <button
                      key={`${e.session_id}-${e.escalated_at}-${idx}`}
                      type="button"
                      onClick={() => setSelectedSessionId(e.session_id)}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 hover:shadow-sm ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{e.requester_name ?? `User #${e.user_id}`}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          {new Date(e.escalated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Session #{e.session_id}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(e.escalated_at).toLocaleDateString()}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
          {selectedSessionId == null ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <MessageCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Select an escalation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                Choose an escalation from the sidebar to view the conversation and provide support
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Session #{selectedSessionId}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Human support active
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSessionId(null)}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/20" ref={messagesContainerRef}>
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                      Loading messages...
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <MessageCircle className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.message_id}
                        className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm max-w-[75%] shadow-sm ${
                            msg.sender === "admin"
                              ? "bg-blue-600 text-white rounded-br-md"
                              : msg.sender === "user"
                                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md"
                                : "bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          <div className="break-words">{msg.message}</div>
                        </div>
                      </div>
                    ))}
                    {isUserTyping && (
                      <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl text-sm max-w-[75%] shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex gap-3">
                  <Input
                    value={adminInput}
                    onChange={(e) => setAdminInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleSendAdminMessage}
                    disabled={!adminInput.trim()}
                    className="px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminChatPage
