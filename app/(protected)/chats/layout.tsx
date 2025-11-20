"use client"

// Imports
import { redirect } from "next/navigation"

// local imports
import { ChatSidebar } from "@/components/chat-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (!user) {
    redirect("/sign-in")
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
