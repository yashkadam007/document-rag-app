"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

export interface Document {
  id: string
  chat_id: string
  filename: string
  size: number
  created_at: string
}

export function useDocuments(chatId: string) {
  const queryClient = useQueryClient()

  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: queryKeys.chats.documents(chatId),
    queryFn: async () => {
      const { data } = await api.get<unknown>(`/chats/${chatId}/documents`)
      if (Array.isArray(data)) {
        return data
          .filter((d): d is { id: string; filename: string; sizeBytes?: number; createdAt?: unknown } =>
            !!d && typeof (d as any).id === "string" && typeof (d as any).filename === "string",
          )
          .map((d) => ({
            id: (d as any).id,
            chat_id: String(chatId),
            filename: (d as any).filename,
            size: Number((d as any).sizeBytes ?? 0),
            created_at: String((d as any).createdAt ?? ""),
          }))
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
