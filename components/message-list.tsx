"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/hooks/use-messages"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Start a conversation</h2>
            <p className="text-muted-foreground">Ask a question to get started</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-2xl px-4 py-3 rounded-lg ${
              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">{new Date(message.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg">
            <div className="flex gap-2">
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
