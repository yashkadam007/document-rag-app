"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useChats } from "@/hooks/use-chats"
import type { Chat } from "@/hooks/use-chats"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Trash2 } from "lucide-react"
import { FileUpload } from "@/components/file-upload"

export function ChatSidebar() {
  const pathname = usePathname()
  const { chats, createChat, createChatLoading, deleteChat } = useChats()
  const { signOut } = useAuth()
  const [newChatTitle, setNewChatTitle] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)

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

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault()
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteChat(chatId)
    }
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/chats" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">◆</div>
          RAG Chat
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-sidebar-border">
        <Button onClick={() => setShowNewChat(!showNewChat)} className="w-full gap-2" variant="outline">
          <Plus className="w-4 h-4" />
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
              }}
              className="w-full px-3 py-2 bg-sidebar-accent text-sidebar-foreground rounded border border-sidebar-border text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateChat}
                disabled={createChatLoading || !newChatTitle.trim()}
                size="sm"
                className="flex-1"
              >
                Create
              </Button>
              <Button onClick={() => setShowNewChat(false)} size="sm" variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats
          .filter((c): c is Chat => Boolean(c) && typeof (c as any).id === "string")
          .map((chat) => {
            const isActive = pathname === `/chats/${chat.id}`
            return (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded transition-colors ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                <span className="flex-1 truncate text-sm">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>
            )
          })}
      </div>

      {pathname.startsWith("/chats/") && (
        <div className="p-4 border-t border-sidebar-border">
          <FileUpload chatId={pathname.split("/")[2]} />
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button onClick={() => signOut()} variant="outline" className="w-full gap-2">
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
