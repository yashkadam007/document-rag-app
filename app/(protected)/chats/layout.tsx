"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { ChatSidebar } from "@/components/chat-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="w-72 border-r border-border p-4 space-y-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    )
  }

  // While redirecting, show nothing to prevent flash
  if (!user) {
    return null
  }

  return (
    <SidebarProvider defaultOpen
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <ChatSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col p-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
