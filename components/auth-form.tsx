"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getApiErrorMessage } from "@/lib/api-error"
import { toast } from "sonner"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { signIn, signInLoading, signUp, signUpLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isSubmitting = mode === "sign-in" ? signInLoading : signUpLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (mode === "sign-in") {
      try {
        await signIn({ email, password })
        router.push("/chats")
      } catch (err) {
        const message = getApiErrorMessage(err)
        setSubmitError(message)
        toast.error("Sign in failed", { description: message })
      }
    } else {
      try {
        await signUp({ email, password, name })
        router.push("/chats")
      } catch (err) {
        const message = getApiErrorMessage(err)
        setSubmitError(message)
        toast.error("Sign up failed", { description: message })
      }
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
              onChange={(e) => {
                setName(e.target.value)
                if (submitError) setSubmitError(null)
              }}
              autoComplete="name"
              disabled={isSubmitting}
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
            onChange={(e) => {
              setEmail(e.target.value)
              if (submitError) setSubmitError(null)
            }}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (submitError) setSubmitError(null)
            }}
            required
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            disabled={isSubmitting}
          />
        </div>

        {submitError && (
          <Alert variant="destructive">
            <AlertTitle>{mode === "sign-in" ? "Couldn’t sign you in" : "Couldn’t create your account"}</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{submitError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Loading..." : mode === "sign-in" ? "Sign in" : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === "sign-in" ? (
          <>
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
