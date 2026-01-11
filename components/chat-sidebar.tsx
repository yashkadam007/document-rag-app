"use client"

import { LogOut, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import type { Chat } from "@/hooks/use-chats"
import { useChats } from "@/hooks/use-chats"
import { cn } from "@/lib/utils"

export function ChatSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { chats, createChat, createChatLoading, deleteChat, deleteChatLoading } = useChats()
  const { signOut } = useAuth()
  const [newChatTitle, setNewChatTitle] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)

  const handleCreateChat = () => {
    if (newChatTitle.trim()) {
      createChat(newChatTitle, {
        onSuccess: () => {
          setNewChatTitle("")
          setShowNewChat(false)
        },
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return
    const deletingId = chatToDelete.id
    const isActive = pathname === `/chats/${deletingId}`
    setChatToDelete(null)
    
    await deleteChat(deletingId)
    
    // If we deleted the active chat, navigate to /chats
    if (isActive) {
      router.push("/chats")
    }
  }

  return (
    <>
      <Sidebar collapsible="offcanvas">
        {/* Header */}
        <SidebarHeader>
          <Link href="/chats" className="flex items-center justify-center gap-2 text-lg">
            Doc Brown
          </Link>
        </SidebarHeader>

        {/* New Chat Button */}
        <div className="p-4 border-b border-sidebar-border">
          <Button
            type="button"
            onClick={() => setShowNewChat(!showNewChat)}
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Chat
          </Button>

          {showNewChat && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Chat title..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateChat()
                  if (e.key === "Escape") setShowNewChat(false)
                }}
                className="w-full px-3 py-2 bg-sidebar-accent text-sidebar-foreground rounded border border-sidebar-border text-sm"
                autoFocus
                aria-label="New chat title"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCreateChat}
                  disabled={createChatLoading || !newChatTitle.trim()}
                  size="sm"
                  className="flex-1"
                >
                  {createChatLoading ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowNewChat(false)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Chat list">
          {chats.map((chat) => {
            const isActive = pathname === `/chats/${chat.id}`
            return (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={isActive}
                onDelete={() => setChatToDelete(chat)}
              />
            )
          })}
        </nav>

        {/* Footer */}
        <SidebarFooter>
          <Button type="button" onClick={() => signOut()} variant="outline" className="w-full gap-2">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Delete confirmation dialog */}
      <AlertDialog open={chatToDelete !== null} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{chatToDelete?.title}&rdquo; and all its messages and documents.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteChatLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteChatLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChatLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Individual chat list item - keeps the delete button outside the Link
 * to avoid nested interactive elements.
 */
function ChatListItem({
  chat,
  isActive,
  onDelete,
}: {
  chat: Chat
  isActive: boolean
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Link
        href={`/chats/${chat.id}`}
        className="flex-1 truncate px-3 py-2 text-sm"
        aria-current={isActive ? "page" : undefined}
      >
        {chat.title}
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className={cn(
          "mr-2 p-1 rounded opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100",
          "hover:bg-destructive/20 focus:bg-destructive/20"
        )}
        aria-label={`Delete ${chat.title}`}
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
