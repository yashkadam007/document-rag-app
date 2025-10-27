import { AuthForm } from "@/components/auth-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AuthForm mode="sign-up" />
    </div>
  )
}
