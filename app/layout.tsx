// Imports
import type { Metadata } from "next"

// local imports
import { Providers } from "./_providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Doc Brown",
  description: "Retrieval-Augmented Generation Chat Application",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
  },
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
