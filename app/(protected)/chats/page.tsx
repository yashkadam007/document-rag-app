"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MessageSquare } from "lucide-react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useChats } from "@/hooks/use-chats"

export default function ChatsPage() {
  const router = useRouter()
  const { chats, isLoading } = useChats()

  useEffect(() => {
    // Redirect to first chat if available
    const firstChat = chats[0]
    if (firstChat?.id) {
      router.replace(`/chats/${firstChat.id}`)
    }
  }, [chats, router])

  // Show nothing while loading or if we're about to redirect
  if (isLoading || chats.length > 0) {
    return null
  }

  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageSquare aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No chats yet</EmptyTitle>
        <EmptyDescription>
          Create a new chat from the sidebar to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
