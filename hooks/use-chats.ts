"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { isRecord, coerceString } from "@/lib/utils"

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

/**
 * Type guard for raw chat objects from the API.
 * Validates that the object has required string fields.
 */
function isRawChat(value: unknown): value is { id: string; title: string; createdAt?: unknown; updatedAt?: unknown } {
  if (!isRecord(value)) return false
  return typeof value.id === "string" && typeof value.title === "string"
}

/**
 * Normalizes a raw chat object to the Chat interface.
 */
function normalizeChat(raw: { id: string; title: string; createdAt?: unknown; updatedAt?: unknown }): Chat {
  return {
    id: raw.id,
    title: raw.title,
    created_at: coerceString(raw.createdAt) ?? "",
    updated_at: coerceString(raw.updatedAt) ?? "",
  }
}

export function useChats() {
  const queryClient = useQueryClient()

  const { data: chats = [], isLoading, error } = useQuery<Chat[]>({
    queryKey: queryKeys.chats.all,
    queryFn: async () => {
      const { data } = await api.get<unknown>("/chats")

      // Backend returns an array at the root per curl. Normalize to Chat[]
      if (Array.isArray(data)) {
        return data.filter(isRawChat).map(normalizeChat)
      }

      // Also support { chats: [...] } just in case
      if (isRecord(data) && Array.isArray(data.chats)) {
        return data.chats.filter(isRawChat).map(normalizeChat)
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
