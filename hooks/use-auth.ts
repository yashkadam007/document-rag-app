"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthSuccessResponse {
  ok?: boolean
  userId: string
  email: string
  name?: string
}

function toUser(data: AuthSuccessResponse): User {
  return { id: data.userId, email: data.email, name: data.name }
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      try {
        const { data } = await api.get<AuthSuccessResponse>("/auth/me")
        return toUser(data)
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const signUpMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; name?: string }) => {
      const { data } = await api.post<AuthSuccessResponse>("/auth/sign-up", credentials)
      return toUser(data)
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(queryKeys.auth.user, newUser)
    },
  })

  const signInMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<AuthSuccessResponse>("/auth/sign-in", credentials)
      return toUser(data)
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(queryKeys.auth.user, newUser)
    },
  })

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/sign-out")
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.user, null)
    },
  })

  return {
    user,
    isLoading,
    error,
    signUp: signUpMutation.mutateAsync,
    signUpLoading: signUpMutation.isPending,
    signUpError: signUpMutation.error,
    signIn: signInMutation.mutateAsync,
    signInLoading: signInMutation.isPending,
    signInError: signInMutation.error,
    signOut: signOutMutation.mutateAsync,
    signOutLoading: signOutMutation.isPending,
    signOutError: signOutMutation.error,
  }
}
