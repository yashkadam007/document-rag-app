"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function useChats() {
  const queryClient = useQueryClient()

  const { data: chats = [], isLoading, error } = useQuery<Chat[]>({
    queryKey: queryKeys.chats.all,
    queryFn: async () => {
      const { data } = await api.get<unknown>("/chats")
      // Backend returns an array at the root per curl. Normalize to Chat[]
      if (Array.isArray(data)) {
        return data
          .filter((c): c is { id: string; title: string; createdAt?: unknown; updatedAt?: unknown } =>
            !!c && typeof (c as any).id === "string" && typeof (c as any).title === "string",
          )
          .map((c) => ({
            id: c.id,
            title: c.title,
            created_at: String(c.createdAt ?? ""),
            updated_at: String(c.updatedAt ?? ""),
          }))
      }
      // Also support { chats: [...] } just in case
      if (data && typeof data === "object" && Array.isArray((data as any).chats)) {
        const arr = (data as any).chats as Array<{ id: string; title: string; created_at?: string; updated_at?: string }>
        return arr.map((c) => ({
          id: c.id,
          title: c.title,
          created_at: String(c.created_at ?? ""),
          updated_at: String(c.updated_at ?? ""),
        }))
      }
      return []
    },
    refetchOnWindowFocus: false,
  })

  const createChatMutation = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const { data } = await api.post<Chat>("/chats", { title })
      return data
    },
    onSuccess: (newChat, _vars, context) => {
      queryClient.setQueryData<Chat[]>(queryKeys.chats.all, (old = []) => [newChat, ...old])
        ; (context as { onSuccess?: () => void } | undefined)?.onSuccess?.()
    },
  })

  const deleteChatMutation = useMutation({
    mutationFn: async ({ chatId }: { chatId: string }) => {
      await api.delete(`/chats/${chatId}`)
      return chatId
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Chat[]>(queryKeys.chats.all, (old = []) => old.filter((c) => c.id !== deletedId))
    },
  })

  const createChat = (title: string, options?: { onSuccess?: () => void }) =>
    createChatMutation.mutateAsync({ title }, {
      onSuccess: () => {
        options?.onSuccess?.()
      },
    })

  const deleteChat = (chatId: string) => deleteChatMutation.mutateAsync({ chatId })

  return {
    chats,
    isLoading,
    error,
    createChat,
    createChatLoading: createChatMutation.isPending,
    deleteChat,
    deleteChatLoading: deleteChatMutation.isPending,
  }
}
