"use client"

// Imports 
import { Toaster } from "sonner";

// local imports
import { ThemeProvider } from "@/app/_providers/theme"
import { queryClient } from "@/lib/query-client"
import { QueryClientProvider } from "@tanstack/react-query"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster closeButton richColors position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
