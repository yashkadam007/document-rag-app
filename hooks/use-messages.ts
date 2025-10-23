"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  created_at: string
}

export interface AskResponse {
  answer: string
  sources: Array<{ filename: string; chunkId: string }>
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading, error } = useQuery<Message[]>({
    queryKey: queryKeys.chats.messages(chatId),
    queryFn: async () => {
      const { data } = await api.get<unknown>(`/chats/${chatId}/messages`)
      if (Array.isArray(data)) {
        return data
          .filter((m): m is { id: string; role: string; content: string; createdAt?: unknown } =>
            !!m && typeof (m as any).id === "string" && typeof (m as any).content === "string",
          )
          .map((m) => ({
            id: (m as any).id,
            chat_id: String(chatId),
            role: ((m as any).role as any) ?? "assistant",
            content: (m as any).content,
            created_at: String((m as any).createdAt ?? ""),
          }))
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
