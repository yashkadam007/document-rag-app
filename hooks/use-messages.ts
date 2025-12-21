"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  /**
   * Backend returns `createdAt` as epoch seconds. We keep this flexible to be
   * resilient to older payloads or different formats.
   */
  created_at: number | string | null
}

export interface AskResponse {
  answer: string
  sources: Array<{ filename: string; chunkId: string }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isMessageRole(value: unknown): value is Message["role"] {
  return value === "user" || value === "assistant" || value === "system" || value === "tool"
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading, error } = useQuery<Message[]>({
    queryKey: queryKeys.chats.messages(chatId),
    queryFn: async () => {
      const { data } = await api.get<unknown>(`/chats/${chatId}/messages`)
      if (Array.isArray(data)) {
        const parsed: Message[] = []
        for (const item of data) {
          if (!isRecord(item)) continue

          const id = typeof item.id === "string" ? item.id : null
          const content = typeof item.content === "string" ? item.content : null
          if (!id || !content) continue

          const role = isMessageRole(item.role) ? item.role : "assistant"
          const createdAt =
            typeof item.createdAt === "number" || typeof item.createdAt === "string" ? item.createdAt : null

          parsed.push({
            id,
            chat_id: String(chatId),
            role,
            content,
            created_at: createdAt,
          })
        }
        return parsed
      }
      return []
    },
    enabled: Boolean(chatId),
    refetchOnWindowFocus: false,
  })

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post<AskResponse>(`/chats/${chatId}/ask`, { q: content })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) })
    },
  })

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMutation.mutateAsync,
    sendMessageLoading: sendMutation.isPending,
    sendMessageError: sendMutation.error,
  }
}
