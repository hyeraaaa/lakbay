"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Mock messages data
const messagesData: Record<
  string,
  Array<{
    id: string
    content: string
    sender: "user" | "other"
    timestamp: string
    avatar?: string
    senderName?: string
  }>
> = {
  "1": [
    {
      id: "1",
      content: "Hey! How are you doing?",
      sender: "other",
      timestamp: "10:30 AM",
      avatar: "/professional-woman.png",
      senderName: "Sarah Chen",
    },
    {
      id: "2",
      content: "I'm doing great! Just finished the new design mockups.",
      sender: "user",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      content: "That sounds amazing! Can you share them with me?",
      sender: "other",
      timestamp: "10:33 AM",
      avatar: "/professional-woman.png",
      senderName: "Sarah Chen",
    },
    {
      id: "4",
      content: "Of course! I'll send them over in a few minutes.",
      sender: "user",
      timestamp: "10:35 AM",
    },
    {
      id: "5",
      content: "Perfect! Also, are we still meeting tomorrow at 3pm?",
      sender: "other",
      timestamp: "10:40 AM",
      avatar: "/professional-woman.png",
      senderName: "Sarah Chen",
    },
    {
      id: "6",
      content: "Yes, absolutely! Looking forward to it.",
      sender: "user",
      timestamp: "10:42 AM",
    },
    {
      id: "7",
      content: "Sounds great! See you tomorrow at 3pm",
      sender: "other",
      timestamp: "10:45 AM",
      avatar: "/professional-woman.png",
      senderName: "Sarah Chen",
    },
  ],
  "2": [
    {
      id: "1",
      content: "Hi! I wanted to give you an update on the project.",
      sender: "other",
      timestamp: "9:15 AM",
      avatar: "/professional-man.png",
      senderName: "Marcus Johnson",
    },
    {
      id: "2",
      content: "Sure, what's the latest?",
      sender: "user",
      timestamp: "9:20 AM",
    },
    {
      id: "3",
      content: "We've completed the backend integration and all tests are passing.",
      sender: "other",
      timestamp: "9:22 AM",
      avatar: "/professional-man.png",
      senderName: "Marcus Johnson",
    },
    {
      id: "4",
      content: "That's excellent news! Great work.",
      sender: "user",
      timestamp: "9:25 AM",
    },
    {
      id: "5",
      content: "Thanks for the update on the project",
      sender: "other",
      timestamp: "9:30 AM",
      avatar: "/professional-man.png",
      senderName: "Marcus Johnson",
    },
  ],
}

export function ChatMessages({ chatId }: { chatId: string }) {
  const messages = messagesData[chatId] || []

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex gap-2", message.sender === "user" ? "justify-end" : "justify-start")}
          >
            {message.sender === "other" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.senderName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {message.senderName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={cn("flex flex-col gap-1", message.sender === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2",
                  message.sender === "user"
                    ? "bg-[var(--chat-bubble-sent)] text-primary-foreground"
                    : "bg-[var(--chat-bubble-received)] text-foreground",
                )}
              >
                <p className="text-sm leading-relaxed text-pretty">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground">{message.timestamp}</span>
            </div>

            {message.sender === "user" && <div className="w-8 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
