"use client"

import { FileUpload } from "@/components/file-upload"
import { ChatInput } from "@/components/chat-input"
import { ChatDocumentsDrawer } from "@/components/chat-documents-drawer"
import { useMessages } from "@/hooks/use-messages"
import { useDocuments } from "@/hooks/use-documents"
import { MessageList } from "@/components/message-list"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChatPage() {
  const params = useParams()
  const chatIdParam = params.chatId
  const chatId = typeof chatIdParam === "string" ? chatIdParam : chatIdParam?.[0] ?? ""
  const { messages, isLoading, sendMessage, sendMessageLoading } = useMessages(chatId)
  const { documents, isLoading: documentsLoading } = useDocuments(chatId)

  const showInlineUpload =
    Boolean(chatId) && !isLoading && messages.length === 0 && !documentsLoading && documents.length === 0

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-end border-b border-border px-2 py-2">
        {chatId && <ChatDocumentsDrawer chatId={chatId} />}
      </div>
      {showInlineUpload && (
        <div className="px-4 sm:px-6 pt-4">
          <Card className="py-4">
            <CardHeader className="pb-3">
              <CardTitle>Upload a document to get started</CardTitle>
              <CardDescription>
                Upload once—then ask questions. You can manage documents later via the Docs button.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload chatId={chatId} />
            </CardContent>
          </Card>
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={sendMessageLoading} />
    </div>
  )
}
