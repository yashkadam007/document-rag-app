"use client"

import { FileText } from "lucide-react"

import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useDocuments } from "@/hooks/use-documents"
import { cn } from "@/lib/utils"

interface ChatDocumentsDrawerProps {
  chatId: string
}

export function ChatDocumentsDrawer({ chatId }: ChatDocumentsDrawerProps) {
  const { documents, isLoading } = useDocuments(chatId)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          aria-label="Open chat documents"
        >
          <FileText className="size-4" />
          Docs
          <span
            className={cn(
              "ml-1 inline-flex min-w-6 items-center justify-center rounded-md px-2 py-0.5 text-xs",
              "bg-muted text-foreground",
            )}
            aria-label={isLoading ? "Loading documents" : `${documents.length} documents`}
          >
            {isLoading ? "…" : documents.length}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Documents</SheetTitle>
          <SheetDescription>Upload files once to ground this chat’s answers.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100svh-84px)] p-4">
          <FileUpload chatId={chatId} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}


