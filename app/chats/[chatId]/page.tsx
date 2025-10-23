"use client"

import { useMessages } from "@/hooks/use-messages"
import { MessageList } from "@/components/message-list"
import { ChatInput } from "@/components/chat-input"
import { useParams } from "next/navigation"

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const { messages, isLoading, sendMessage, sendMessageLoading } = useMessages(chatId)

  return (
    <div className="flex flex-col h-full bg-background">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={sendMessageLoading} />
    </div>
  )
}
