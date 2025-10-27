import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./_providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "RAG Chat",
  description: "Retrieval-Augmented Generation Chat Application",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
