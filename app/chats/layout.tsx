"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useAuth } from "@/hooks/use-auth"

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return null
  }
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}
