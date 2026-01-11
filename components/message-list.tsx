"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/hooks/use-messages"
import { cn, formatTime } from "@/lib/utils"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  isTyping?: boolean
}

export function MessageList({ messages, isLoading, isTyping = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageId = messages[messages.length - 1]?.id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [lastMessageId])

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Start a conversation</h2>
            <p className="text-muted-foreground">Ask a question to get started</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}

      {(isLoading || isTyping) && (
        <div className="flex justify-start">
          <div className="bg-muted text-foreground px-4 py-3 rounded-lg border border-border/50">
            <div className="flex gap-2" aria-label={isLoading ? "Loading messages" : "Assistant is typing"}>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageRow({ message }: { message: Message }) {
  const time = formatTime(message.created_at)
  const isUser = message.role === "user"
  const isSystemOrTool = message.role === "system" || message.role === "tool"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-2xl px-4 py-3 rounded-lg border",
          // Don't tie user bubbles to `primary` (green in this repo). Use adaptive, high-contrast tokens instead.
          isUser && "bg-foreground text-background border-foreground/15",
          !isUser && !isSystemOrTool && "bg-muted text-foreground border-border/50",
          isSystemOrTool && "bg-secondary text-secondary-foreground border-border/50",
        )}
      >
        <p className={cn("text-sm whitespace-pre-wrap break-words leading-relaxed", isSystemOrTool && "italic")}>
          {message.content}
        </p>
        {time && (
          <span className={cn("text-xs mt-1 block", isUser ? "text-background/70" : "text-muted-foreground")}>{time}</span>
        )}
      </div>
    </div>
  )
}
