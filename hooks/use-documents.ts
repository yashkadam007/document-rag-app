"use client"

import { useCallback, useRef, useState } from "react"
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

export interface UploadProgress {
  /** Bytes uploaded so far */
  loaded: number
  /** Total bytes (may be undefined if server doesn't send Content-Length) */
  total: number | undefined
  /** Percent complete (0-100), only valid when total is known */
  percent: number | undefined
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
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
      // Create new abort controller for this upload
      abortControllerRef.current = new AbortController()
      
      // Reset progress at start
      setUploadProgress({ loaded: 0, total: file.size, percent: 0 })
      
      const formData = new FormData()
      formData.append("file", file)
      
      const { data } = await api.post<{ ok: boolean; documentId: string }>(
        `/chats/${chatId}/documents/file`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal: abortControllerRef.current.signal,
          onUploadProgress: (progressEvent) => {
            const loaded = progressEvent.loaded
            // total may be undefined if Content-Length header is missing
            const total = progressEvent.total
            const percent = total !== undefined && total > 0
              ? Math.round((loaded / total) * 100)
              : undefined
            
            setUploadProgress({ loaded, total, percent })
          },
        }
      )
      
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
      // Reset progress after short delay to allow UI to show completion
      setTimeout(() => setUploadProgress(null), 300)
    },
    onError: () => {
      // Reset progress on error
      setUploadProgress(null)
    },
    onSettled: () => {
      // Clean up abort controller
      abortControllerRef.current = null
    },
  })

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setUploadProgress(null)
    }
  }, [])

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
    uploadProgress,
    cancelUpload,
    deleteDocument: deleteMutation.mutateAsync,
    deleteDocumentLoading: deleteMutation.isPending,
  }
}
