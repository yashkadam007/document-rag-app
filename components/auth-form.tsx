"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { signIn, isLoading, error, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "sign-in") {
      signIn(
        { email, password },
        {
          onSuccess: () => router.push("/chats"),
          onError: (error) => {
            toast.error("Something went wrong", {
              description: error.message
            })
          }
        },
      )
    } else {
      signUp(
        { email, password, name },
        {
          onSuccess: () => router.push("/chats"),
        },
      )
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{mode === "sign-in" ? "Welcome back" : "Create account"}</h1>
        <p className="text-muted-foreground">
          {mode === "sign-in" ? "Sign in to your account to continue" : "Sign up to get started with RAG Chat"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Loading..." : mode === "sign-in" ? "Sign in" : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === "sign-in" ? (
          <>
            Don't have an account?{" "}
            <a href="/sign-up" className="text-primary hover:underline">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary hover:underline">
              Sign in
            </a>
          </>
        )}
      </div>
    </div>
  )
}
