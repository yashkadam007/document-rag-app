"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border-t border-border bg-background">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <Input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-9"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
