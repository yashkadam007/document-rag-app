"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { toast } from "sonner"

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

function createClientId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.()
  return `${prefix}-${uuid ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient()
  const messagesQueryKey = queryKeys.chats.messages(chatId)

  const { data: messages = [], isLoading, error } = useQuery<Message[]>({
    queryKey: messagesQueryKey,
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
      const { data } = await api.post<AskResponse>(`/chats/${chatId}/ask`, { q: content })
      return data
    },
    onMutate: async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return null

      await queryClient.cancelQueries({ queryKey: messagesQueryKey })
      const previous = queryClient.getQueryData<Message[]>(messagesQueryKey)

      const optimisticUserMessage: Message = {
        id: createClientId("user"),
        chat_id: String(chatId),
        role: "user",
        content: trimmed,
        created_at: Date.now(),
      }

      queryClient.setQueryData<Message[]>(messagesQueryKey, (old = []) => [...old, optimisticUserMessage])

      return { previous }
    },
    onSuccess: (data) => {
      if (data?.answer) {
        const optimisticAssistantMessage: Message = {
          id: createClientId("assistant"),
          chat_id: String(chatId),
          role: "assistant",
          content: data.answer,
          created_at: Date.now(),
        }
        queryClient.setQueryData<Message[]>(messagesQueryKey, (old = []) => [...old, optimisticAssistantMessage])
      }

      // Reconcile with server IDs + timestamps in the background.
      queryClient.invalidateQueries({ queryKey: messagesQueryKey })
    },
    onError: (err) => {
      // `/ask` can fail after the user message is already persisted server-side (e.g. model error),
      // so keep the optimistic user message and refetch to reconcile server state.
      toast.error(err instanceof Error ? err.message : "Failed to get an answer. Your message was sent.")
      queryClient.invalidateQueries({ queryKey: messagesQueryKey })
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
