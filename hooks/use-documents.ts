"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { isRecord, coerceString } from "@/lib/utils"

export interface Document {
  id: string
  chat_id: string
  filename: string
  size: number
  created_at: string
}

/**
 * Type guard for raw document objects from the API.
 */
function isRawDocument(value: unknown): value is { id: string; filename: string; sizeBytes?: unknown; createdAt?: unknown } {
  if (!isRecord(value)) return false
  return typeof value.id === "string" && typeof value.filename === "string"
}

/**
 * Normalizes a raw document object to the Document interface.
 */
function normalizeDocument(raw: { id: string; filename: string; sizeBytes?: unknown; createdAt?: unknown }, chatId: string): Document {
  const size = typeof raw.sizeBytes === "number" ? raw.sizeBytes : 0
  return {
    id: raw.id,
    chat_id: chatId,
    filename: raw.filename,
    size: Number.isFinite(size) ? size : 0,
    created_at: coerceString(raw.createdAt) ?? "",
  }
}

export function useDocuments(chatId: string) {
  const queryClient = useQueryClient()

  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: queryKeys.chats.documents(chatId),
    queryFn: async () => {
      const { data } = await api.get<unknown>(`/chats/${chatId}/documents`)
      if (Array.isArray(data)) {
        return data.filter(isRawDocument).map((d) => normalizeDocument(d, chatId))
      }
      return []
    },
    enabled: Boolean(chatId),
    refetchOnWindowFocus: false,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await api.post<{ ok: boolean; documentId: string }>(`/chats/${chatId}/documents/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return {
        id: data.documentId,
        chat_id: String(chatId),
        filename: file.name,
        size: file.size,
        created_at: String(Date.now()),
      } as Document
    },
    onSuccess: (newDoc) => {
      queryClient.setQueryData<Document[]>(queryKeys.chats.documents(chatId), (old = []) => [newDoc, ...old])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await api.delete(`/documents/${documentId}`)
      return documentId
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Document[]>(queryKeys.chats.documents(chatId), (old = []) =>
        old.filter((doc) => doc.id !== deletedId),
      )
    },
  })

  return {
    documents,
    isLoading,
    error,
    uploadDocument: uploadMutation.mutateAsync,
    uploadDocumentLoading: uploadMutation.isPending,
    uploadDocumentError: uploadMutation.error,
    deleteDocument: deleteMutation.mutateAsync,
    deleteDocumentLoading: deleteMutation.isPending,
  }
}
