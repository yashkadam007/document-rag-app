"use client"

import { useChats } from "@/hooks/use-chats"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ChatsPage() {
  const router = useRouter()
  const { chats } = useChats()

  useEffect(() => {
    const first = chats.find((c) => c && typeof (c as any).id === "string")
    if (first) {
      router.push(`/chats/${first.id}`)
    }
  }, [chats, router])

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">No chats yet</h1>
        <p className="text-muted-foreground">Create a new chat to get started</p>
      </div>
    </div>
  )
}
